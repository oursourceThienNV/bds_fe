import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { GroupTeamService } from '../../../core/services/services-app/group-team.service';

interface GroupTeam {
  id: number;
  name: string;
  rootId: number;
  headUsername?: string;
  headFullname?: string;
  level: number;
  description?: string;
}

@Component({
  selector: 'app-tree-group-team',
  templateUrl: './tree-group-team.component.html',
  styleUrls: ['./tree-group-team.component.scss']
})
export class TreeGroupTeamComponent implements OnInit {
  @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;

  groupData: GroupTeam[] = [];
  companyId: any;
  groupMainId:any;

  constructor(private groupTeamService: GroupTeamService) {}

  ngOnInit(): void {
    this.getGroupView();
  }

  getGroupView(): void {
    const body = { companyId: this.companyId, groupMainId:this.groupMainId};
    this.groupTeamService.findGroupTeamViewByCompanyId(body).subscribe({
      next: (res) => {
        if (res?.body?.responseCode === '200') {
          this.groupData = res.body.body || [];
          const treeData = this.buildTree(this.groupData);
          this.drawTree(treeData);
        } else {
          console.error('Lỗi lấy dữ liệu tổ chức:', res?.responseMessage);
        }
      },
      error: (err) => console.error('Lỗi kết nối:', err)
    });
  }

  buildTree(data: GroupTeam[]): any {
    const idMap: Record<number, any> = {};
    let root: any;

    data.forEach(item => {
      idMap[item.id] = { ...item, children: [] };
    });

    data.forEach(item => {
      if (item.rootId === 0) {
        root = idMap[item.id];
      } else {
        idMap[item.rootId]?.children.push(idMap[item.id]);
      }
    });

    return root;
  }

  drawTree(data: any) {
    d3.select(this.treeContainer.nativeElement).selectAll('*').remove();

    const svgWidth = 1200;
    const svgHeight = 800;

    const svg = d3
      .select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    const g = svg.append('g').attr('transform', `translate(${svgWidth / 2}, 80)`);

    // Dùng nodeSize thay vì size để giữ khoảng cách cố định
    const treeLayout = d3.tree<any>().nodeSize([200, 120]);

    const root = d3.hierarchy(data);
    treeLayout(root);

    // Căn giữa cây theo trục X
    const xMin = d3.min(root.descendants(), d => d.x)!;
    const xMax = d3.max(root.descendants(), d => d.x)!;
    const xOffset = (xMax + xMin) / 2;

    // Dịch cây về giữa
    root.descendants().forEach(d => (d.x -= xOffset));

    // Link lines
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .linkVertical()
          .x((d: any) => d.x)
          .y((d: any) => d.y)
      );

    // Nodes
    const node = g
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    node
      .append('rect')
      .attr('x', -80)
      .attr('y', -30)
      .attr('width', 160)
      .attr('height', 60)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('fill', '#42A5F5')
      .attr('stroke', '#1565C0')
      .attr('stroke-width', 2);

    node
      .append('text')
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', '14px')
      .text((d: any) => d.data.name);

    node
      .append('text')
      .attr('y', 8)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', '12px')
      .text((d: any) => d.data.headUsername || '');

    node
      .append('text')
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', '12px')
      .text((d: any) => d.data.headFullname || '');
  }
}
