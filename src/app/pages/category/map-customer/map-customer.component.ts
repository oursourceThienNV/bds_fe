import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy, OnInit,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import {jwtDecode} from "jwt-decode";
import {CustomerService} from "../../../core/services/services-app/customer.service";
import {CommonCodeServices} from "../../../core/services/services-app/common-code.service";
export interface UserNode {
  id: string;      // 'u10'
  rawId: number;   // 10
  name: string;
  phone: string;
  bought: boolean;
  avatar: string;
  x?: number; y?: number;   // vị trí vẽ
}

interface UserLink {
  source: string;        // 'u10'
  target: string;        // 'u23'
  label?: string;        // Cha con / Đối tác...
}
type ApiRelationship = {
  id: number;         // id bản ghi quan hệ
  label: string;      // 'Bạn bè' | 'Đối tác' ... (có thể sai chính tả từ BE)
  customerId: number; // id khách hàng liên hệ
  code: number;       // mã quan hệ (nếu dùng)
};

type ApiResponse<T> = {
  responseCode: string;
  responseMessage: string;
  body: T;
};
type RelationshipItem = { id:number; label:string; customerId:number; code:number };

@Component({
  selector: 'app-root',
  templateUrl: 'map-customer.component.html',
  styleUrls: ['./map-customer.component.scss'],
})
export class MapCustomerComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('svgRef',    { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('graphHost', { static: true }) graphHost!: ElementRef<HTMLDivElement>;
  @ViewChild('sidePanel', { static: true }) sidePanel!: ElementRef<HTMLDivElement>;
  @ViewChild('appRoot',   { static: true }) appRoot!: ElementRef<HTMLDivElement>;

  // ---------- UI
  query = '';
  selected: UserNode | null = null;     // chỉ khi có selected mới hiển thị graph

  // ---------- data
  cusotmers: UserNode[] = [];
  nodes: UserNode[] = [];               // toàn bộ user (để lấy info)
  nodesShown: UserNode[] = [];          // CHỈ các node đang hiển thị (selected + neighbors)
  links: UserLink[] = [];
  relationShipCustomer:any;// CHỈ các link từ selected -> neighbor
  private relationshipsByUserId = new Map<number, RelationshipItem[]>(); // FAKE demo

  // ---------- sizing (tọa độ trong viewBox)
  private width = 800;
  private height = 600;
  private readonly PAD = 22;         // đệm biên để avatar (r~15) không bị cắt
  private readonly NODE_DIAM = 30;   // ~ avatar 26 + đệm
  private readonly MIN_ARC_GAP = 12; // khoảng cách tối thiểu giữa 2 avatar trên cùng vòng

  // ---------- d3 layers
  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private gLinks?: d3.Selection<SVGLineElement, any, any, any>;
  private gNodes?: d3.Selection<SVGGElement, any, any, any>;
  private gLabels?: d3.Selection<SVGTextElement, any, any, any>;
  workSpaceId:any;
  lables:any;
  trangThaiMuaHang:any;
  private ro?: ResizeObserver;


  // ---------- sidebar filter
  get filteredCustomers(): UserNode[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.cusotmers;
    return this.cusotmers.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q));
  }
  async ngOnInit(): Promise<void> {
    const authWs = localStorage.getItem('authWs');
    const decodedWs: any = jwtDecode(authWs);
    this.workSpaceId=decodedWs.workSpaceId;
    await this.getListCommonCode();
    await this.getListAllCustomer();
  }
  constructor(private zone: NgZone,private customerService:CustomerService,private commonCodeService:CommonCodeServices) {

    // ==== FAKE cusotmers
    const AVATAR = (i: number) => `https://i.pravatar.cc/100?img=${(i % 70) + 1}`;
    // const N = 80;
    // // this.cusotmers = Array.from({ length: N }, (_, i) => ({
    // //   rawId: i + 1,
    // //   id: `u${i + 1}`,
    // //   name: `Khách hàng ${i + 1}`,
    // //   phone: `0${Math.floor(1e8 + Math.random() * 9e8)}`,
    // //   status: Math.random() > 0.5,
    // //   avatar: AVATAR(i + 1),
    // // }));
    // // this.nodes = this.cusotmers.map(u => ({ ...u }));
    //
    // // ==== FAKE relationships (khi có API: bỏ phần này)
    // const labels = ['Cha con','Mẹ con','Anh em','Bạn bè','Đối tác','Đồng nghiệp'];
    // for (let i = 1; i <= N; i++) {
    //   const cnt = 6 + Math.floor(Math.random() * 6); // 6-11 quan hệ
    //   const rels: RelationshipItem[] = [];
    //   const used = new Set<number>();
    //   while (rels.length < cnt) {
    //     let other = 1 + Math.floor(Math.random() * N);
    //     if (other === i || used.has(other)) continue;
    //     used.add(other);
    //     rels.push({
    //       id: i * 1000 + other,
    //       label: labels[Math.floor(Math.random() * labels.length)],
    //       customerId: other,
    //       code: 16
    //     });
    //   }
    //   this.relationshipsByUserId.set(i, rels);
    // }
  }
  async getListCommonCode(){
    const body={
      workSpaceId:this.workSpaceId
    }
    this.commonCodeService.listCommonByWorkSpaceId(body).subscribe(res=>{
      if (res && res.body.responseCode === '200') {
        debugger;// hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.trangThaiMuaHang = res.body.body;
      } else {
        console.error('Danh sách tỉnh:', res.responseMessage);
      }
    })
  }
  private mapApiToRelationshipItems(apiList: ApiRelationship[]): RelationshipItem[] {
    return (apiList ?? []).map(r => ({
      id: r.id,                 // Giữ id BE để tiện debug
      label: r.label?.trim() || 'Không rõ',
      customerId: r.customerId, // Đối tượng “other”
      code: r.code ?? 0,
    }));
  }
  private upsertRelationships(userId: number, rels: RelationshipItem[]) {
    this.relationshipsByUserId.set(userId, rels);
  }
  async getRelationShipAsync(userIdIn: string | number) {
    try {
      // bodyId: GỬI NGUYÊN XI cái bạn truyền vào (ví dụ "u10")
      const bodyId = userIdIn;
      const body = { id: bodyId };

      const res: { body: ApiResponse<ApiRelationship[]> } =
        await this.customerService.searchRelationShip(body).toPromise();

      const api = res?.body;
      if (api?.responseCode === '200') {
        const rels = this.mapApiToRelationshipItems(api.body);

        // key để lưu Map: ƯU TIÊN rawId (number) nếu có, nếu không thì fallback sang parse id
        const numericKey =
          typeof this.selected?.rawId === 'number' && Number.isFinite(this.selected.rawId)
            ? this.selected.rawId
            : (typeof userIdIn === 'number'
              ? userIdIn
              : Number(String(userIdIn).replace(/\D+/g, '')));

        if (Number.isFinite(numericKey)) {
          this.upsertRelationships(Number(numericKey), rels);
        } else {
          // Trường hợp bất khả kháng: vẫn lưu thêm theo chuỗi id để tra cứu dự phòng
          // (nếu bạn muốn hỗ trợ Map<string, ...> thì tách Map khác)
          console.warn('Không suy ra được numericKey từ id, kiểm tra lại schema:', userIdIn);
        }
      } else {
        console.error('Danh sách khách hàng:', api?.responseMessage);
      }
    } catch (err) {
      console.error('Lỗi API getRelationShip:', err);
    }
  }

  async getListAllCustomer() {
    const body = { id: this.workSpaceId };
    this.customerService.getAll(body).subscribe({
      next: (res) => {
        if (res && res.body.responseCode === '200') {
          const AVATAR = (i: number) => `https://i.pravatar.cc/100?img=${(i % 70) + 1}`;
          this.cusotmers = res.body.body.map((c: any, i: number) => {
            const statusObj = this.trangThaiMuaHang.find(s => s.code === c.tinhTrangMuaHang);
            return {
              id: c.id,
              name: c.hoTen,
              phone: c.sdt,
              avatar: AVATAR(i + 1),
              status: statusObj ? statusObj.name : 'Không xác định'
            };
          });

          this.nodes = this.cusotmers.map(u => ({ ...u }));
          const labels = ['Cha con','Mẹ con','Anh em','Bạn bè','Đối tác','Đồng nghiệp'];
        } else {
          console.error('Danh sách khách hàng:', res.body.responseMessage);
        }
      },
      error: (err) => {
        console.error('Lỗi API getAll:', err);
      }
    });
  }

  // ===== lifecycle =====
  ngAfterViewInit(): void {
    this.initSvg();
    this.setupResizeObserver(); // đo content box + set viewBox; ban đầu không render gì
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  // ===== click ở sidebar: lúc này MỚI hiển thị graph =========
  async onPick(u: UserNode) {
    // GỌI API bằng id (vd: "u10")
    await this.getRelationShipAsync(u.id);

    this.selected = u;
    this.layoutStarForSelected(u);
    this.render();
  }

// ====== BỐ TRÍ "STAR": CHỈ CENTER + NEIGHBORS TRỰC TIẾP ======
  private layoutStarForSelected(center: UserNode) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // 1) Node trung tâm
    const centerNode = { ...center, x: cx, y: cy } as UserNode;

    // 2) Lấy danh sách quan hệ
    let relList = this.relationshipsByUserId.get(center.rawId) ?? [];
    if (relList.length === 0) {
      const fallbackKey = Number(String(center.id).replace(/\D+/g, ''));
      if (Number.isFinite(fallbackKey)) {
        relList = this.relationshipsByUserId.get(fallbackKey) ?? [];
      }
    }

    // 3) Bán kính + sức chứa
    const r = Math.max(0, Math.min(cx, cy) - this.PAD);
    const spacing = this.NODE_DIAM + this.MIN_ARC_GAP;
    const capacity = Math.max(1, Math.floor((2 * Math.PI * r) / spacing));

    // 4) Tạo danh sách neighbor từ dữ liệu hiện có
    const idSet = new Set(relList.map(r => `u${r.customerId}`));
    const fromExisting = this.nodes.filter(n => idSet.has(n.id));
    const stillNeed = Math.max(0, capacity - fromExisting.length);

    // 5) Tạo placeholder cho các neighbor chưa có trong this.nodes
    const placeholders: UserNode[] = relList
      .filter(rel => !this.nodes.find(n => n.id === `u${rel.customerId}`))
      .slice(0, stillNeed)
      .map(rel => {
        // tìm thông tin trong danh sách customers (có thể bạn lấy từ API getAll)
        const cust = this.cusotmers.find(c => Number(c.id) === Number(rel.customerId));

        return {
          id: `u${rel.customerId}`,
          rawId: rel.customerId,
          name: cust?.name ?? `Khách #${rel.customerId}`,
          phone: cust?.phone ?? '',
          bought: cust?.bought ?? false,
          avatar: cust?.avatar || 'assets/default-avatar.png',
        } as UserNode;
      });

    // 6) GHÉP neighbors cuối cùng (tối đa capacity)
    const neighbors = [...fromExisting, ...placeholders]
      .slice(0, capacity)
      .map(n => ({ ...n }));

    // 7) Đẩy các placeholder mới vào this.nodes để D3 có thể render
    for (const nb of placeholders) {
      if (!this.nodes.find(n => n.id === nb.id)) {
        this.nodes.push(nb);
      }
    }

    // 8) Bố trí vị trí + set state để render
    this.placeOnRing(neighbors, cx, cy, r);
    this.nodesShown = [centerNode, ...neighbors];

    this.links = neighbors.map(n => {
      const rel = relList.find(rr => `u${rr.customerId}` === n.id);
      return { source: centerNode.id, target: n.id, label: rel?.label };
    });
  }

  /** Đặt node đều nhau trên vòng (cx,cy,r) */
  private placeOnRing(arr: UserNode[], cx: number, cy: number, r: number) {
    const n = arr.length;
    if (n === 0) return;
    if (r <= 0) {
      arr.forEach(nn => { nn.x = cx; nn.y = cy; });
      return;
    }
    const tau = Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * tau;
      arr[i].x = cx + r * Math.cos(a);
      arr[i].y = cy + r * Math.sin(a);
    }
  }


  /** Đặt node đều nhau trên vòng (cx,cy,r) */

  /** Đặt node đều nhau trên một vòng (cx,cy,r) — chỉ để bố trí vị trí, không vẽ vòng */
  // private placeOnRing(arr: UserNode[], cx: number, cy: number, r: number) {
  //   const n = arr.length;
  //   if (n === 0) return;
  //   if (r <= 0) { arr.forEach(nn => { nn.x = cx; nn.y = cy; }); return; }
  //   const tau = Math.PI * 2;
  //   for (let i = 0; i < n; i++) {
  //     const a = (i / n) * tau;
  //     arr[i].x = cx + r * Math.cos(a);
  //     arr[i].y = cy + r * Math.sin(a);
  //   }
  // }

  // ===== D3 =====
  private initSvg() {
    this.svg = d3.select(this.svgRef.nativeElement)
      .attr('preserveAspectRatio', 'none') // cho phép SVG fill container
      .style('background', '#fff');

    this.gLinks  = this.svg.append('g').attr('class', 'links').selectAll('line');
    this.gNodes  = this.svg.append('g').attr('class', 'nodes').selectAll('g');
    this.gLabels = this.svg.append('g').attr('class', 'labels').selectAll('text');

    // bind nodes một lần (tất cả user), nhưng sẽ ẩn khi chưa chọn
    this.gNodes = this.gNodes!.data(this.nodes, (d: any) => d.id);
    const enter = this.gNodes.enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (_, d: UserNode) => this.onPick(d));

    enter.append('circle')
      .attr('r', 15).attr('fill', '#fff')
      .attr('stroke', '#d1d5db').attr('stroke-width', 2);

    enter.append('image')
      .attr('x', -13).attr('y', -13)
      .attr('width', 26).attr('height', 26)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('href', (d: any) => d.avatar);

    enter.append('title').text((d: any) => `${d.name}\n${d.phone}`);

    this.gNodes = enter.merge(this.gNodes as any);

    // render lần đầu → không hiện gì vì chưa chọn ai
    this.render();
  }

  /** Vẽ theo nodesShown + links; nếu chưa chọn thì ẩn hết */
  private render() {
    if (!this.svg) return;

    const showSet = new Set(this.nodesShown.map(n => n.id));

    // ---- JOIN lại nodes với dữ liệu mới (nodesShown)
    this.gNodes = this.gNodes!.data(this.nodes, (d: any) => d.id);

    // ENTER: node mới
    const enter = this.gNodes.enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (_, d: UserNode) => this.onPick(d));

    enter.append('circle')
      .attr('r', 15).attr('fill', '#fff')
      .attr('stroke', '#d1d5db').attr('stroke-width', 2);

    enter.append('image')
      .attr('x', -13).attr('y', -13)
      .attr('width', 26).attr('height', 26)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('href', (d: any) => d.avatar || 'assets/default-avatar.png');

    enter.append('title').text((d: any) => `${d.name}\n${d.phone}`);

    this.gNodes = enter.merge(this.gNodes as any);

    // UPDATE vị trí + display
    this.gNodes
      .attr('display', (d: any) => showSet.has(d.id) ? null : 'none')
      .attr('transform', (d: any) => {
        if (!showSet.has(d.id)) return 'translate(-9999,-9999)';
        const nn = this.nodesShown.find(n => n.id === d.id)!;
        return `translate(${nn.x},${nn.y})`;
      });

    // stroke highlight
    this.gNodes.select('circle')
      .attr('stroke', (d: any) => this.selected && d.id === this.selected.id ? '#2563eb' : '#d1d5db')
      .attr('stroke-width', (d: any) => this.selected && d.id === this.selected.id ? 3 : 2);

    // ---- Links & Labels giữ nguyên như bạn có
    this.gLinks = this.gLinks!.data(this.links, (d: any) => `${d.source}-${d.target}`);
    this.gLinks.exit().remove();
    const linksEnter = this.gLinks.enter().append('line');
    this.gLinks = linksEnter.merge(this.gLinks as any)
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 2)
      .attr('opacity', 0.95)
      .attr('x1', (d: any) => this.nodeByIdShown(d.source)?.x ?? 0)
      .attr('y1', (d: any) => this.nodeByIdShown(d.source)?.y ?? 0)
      .attr('x2', (d: any) => this.nodeByIdShown(d.target)?.x ?? 0)
      .attr('y2', (d: any) => this.nodeByIdShown(d.target)?.y ?? 0);

    this.gLabels = this.gLabels!.data(this.links, (d: any) => `${d.source}-${d.target}`);
    this.gLabels.exit().remove();
    const labelsEnter = this.gLabels.enter().append('text')
      .attr('font-size', 10)
      .attr('fill', '#6b7280')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none');
    this.gLabels = labelsEnter.merge(this.gLabels as any)
      .text((d: any) => d.label ?? '')
      .attr('x', (d: any) => {
        const a = this.nodeByIdShown(d.source)!; const b = this.nodeByIdShown(d.target)!;
        return (a.x! + b.x!) / 2;
      })
      .attr('y', (d: any) => {
        const a = this.nodeByIdShown(d.source)!; const b = this.nodeByIdShown(d.target)!;
        return (a.y! + b.y!) / 2 - 4;
      })
      .attr('display', (d: any) => d.label ? null : 'none');
  }


  private nodeByIdShown(id: string) {
    return this.nodesShown.find(n => n.id === id);
  }

  // ===== Size/Resize: đo CONTENT BOX + set viewBox (fix khoảng trắng) =====
  private setupResizeObserver() {
    const setSizeAndLayout = () => {
      const host = this.graphHost.nativeElement;

      // đo content box: clientSize đã INCLUDE padding ⇒ trừ padding để lấy vùng vẽ thực
      const cs = getComputedStyle(host);
      const pl = parseFloat(cs.paddingLeft || '0');
      const pr = parseFloat(cs.paddingRight || '0');
      const pt = parseFloat(cs.paddingTop || '0');
      const pb = parseFloat(cs.paddingBottom || '0');

      const contentW = Math.max(0, host.clientWidth  - pl - pr);
      const contentH = Math.max(0, host.clientHeight - pt - pb);

      this.width  = Math.floor(Math.max(320, contentW));
      this.height = Math.floor(Math.max(260, contentH));

      // SVG fill container theo CSS; viewBox = kích thước vẽ thực
      this.svg!.attr('viewBox', `0 0 ${this.width} ${this.height}`);

      if (this.selected) this.layoutStarForSelected(this.selected);
      this.render();
    };

    this.ro = new ResizeObserver(() => {
      // đợi layout ổn định trước khi đo
      requestAnimationFrame(setSizeAndLayout);
    });

    // quan sát khung vẽ & các vùng có thể ảnh hưởng kích thước
    this.ro.observe(this.appRoot.nativeElement);
    this.ro.observe(this.sidePanel.nativeElement);
    this.ro.observe(this.graphHost.nativeElement);

    setSizeAndLayout(); // lần đầu
  }
}
