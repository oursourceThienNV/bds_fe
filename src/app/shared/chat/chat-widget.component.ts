import { Component, HostListener, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService } from '../../core/services/user.service';
import { ApiUrl } from '../constant/ApiUrl.constant';
import { ChatService } from '../../core/services/services-app/chat.service';
import {MediaService} from "../../core/services/services-app/media.service";

interface User {
  id: number;
  fullname: string;
  username?: string;
  logoUrl?: string; // ảnh đại diện từ server
  avatar?: string;  // fallback field nếu API trả về 'avatar'
}

interface Group {
  id: number;
  name: string;
  listUser?: number[];
  avatar?: string;
  companyId: number;
}

type ChatType = 'user' | 'group';
type ChatKey = string;

interface ChatWindow {
  key: ChatKey;
  type: ChatType;
  data: User | Group;
  newMessage: string;
  selectedFile: File | null;
  showMemberPanel: boolean;
  memberSearchTerm?: string;
  showMenu?: boolean;
  roomId?: number; // <- dùng cho DM 1-1
}

export interface ChatMessage {
  from: 'me' | 'other';
  text?: string;
  time: Date;
  // file
  fileUrl?: string;
  fileName?: string;
  isImage?: boolean;
  // only for 'other'
  avatar?: string;
  fullname?: string;
}

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css'],
})
export class ChatWidgetComponent implements OnInit {
  showChatList = false;
  creatingGroup = false;

  openChats: ChatWindow[] = [];
  activeKey: ChatKey | null = null;

  // Modals
  showRenameModal = false;
  showAvatarModal = false;
  showDeleteConfirm = false;

  newGroupName = '';
  avatarFile: File | null = null;
  avatarPreview: string | null = null;

  // Create group
  groupName = '';
  selectedUserIds = new Set<number>();
  createSearchTerm = '';

  companyId: any;
  currentId: any;

  users: User[] = [];
  groups: Group[] = [];

  url: any;

  // Lưu messages theo mỗi cửa sổ (key)
  chatMessages: Record<ChatKey, ChatMessage[]> = {};

  // Lưu danh sách member theo groupId (để panel thành viên không đè nhau)
  groupMembers: Record<number, number[]> = {};

  searchText: string = '';
  creatingDm = false;
  dmSearchTerm = '';
  selectedDmUserId: number | null = null;
  usersById: Map<number, User> = new Map<number, User>();
// Nếu backend trả roomId cho từng cặp 1-1, có thể cache lại:
  dmRoomIdByUser: Record<number, number> = {};
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserProfileService,
    private api: ApiUrl,
    private chatService: ChatService,
    private mediaService:MediaService,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authData');
    const decoded: any = jwtDecode(token || '');
    this.companyId = decoded?.companyId;
    this.currentId = decoded?.userId;

    this.getAllUserService();
    this.getAllGroup();
    this.url = this.api.getCatalogApi();
  }

  getAllUserService() {
    const body = { companyId: this.companyId };
    this.userService.findAllByCompanyId(body).subscribe(
      (res) => {
        if (res && res.body?.responseCode === '200') {
          this.users = res.body.body || [];
          this.usersById.clear();
          for (const u of this.users) {
            if (u?.id != null) this.usersById.set(Number(u.id), u);
          }
        }
      }
    );
  }

  getAllGroup() {
    const body = { companyId: this.companyId };
    this.chatService.search(body).subscribe(
      (res) => {
        if (res && res.body?.responseCode === '200') {
          this.groups = res.body.body || [];
        } else {
          console.error('Lỗi lấy danh sách nhóm:', res?.responseMessage);
        }
      },
      (error) => {
        console.error('Lỗi kết nối đến server:', error);
      }
    );
  }

  get filteredUsers() {
    if (!this.searchText) return this.users;
    const text = this.searchText.toLowerCase();
    return this.users.filter(
      (user) =>
        (user.username && user.username.toLowerCase().includes(text)) ||
        (user.fullname && user.fullname.toLowerCase().includes(text))
    );
  }

  private userKey(u: User): ChatKey {
    return `user-${u.id}`;
  }
  private groupKey(g: Group): ChatKey {
    return `group-${g.id}`;
  }
  trackByKey = (_: number, w: ChatWindow) => w.key;

  get activeGroup(): Group | null {
    if (!this.activeKey) return null;
    const w = this.openChats.find((x) => x.key === this.activeKey);
    return w?.type === 'group' ? (w.data as Group) : null;
  }

  toggleChatList() {
    if (this.creatingGroup) {
      this.creatingGroup = false;
      return;
    }
    this.showChatList = !this.showChatList;
  }

  openGroupChat(group: any) {
    // 1) Chuẩn hoá id phòng (BE Mongo có thể trả _id)
    const roomId = group?.id ?? group?._id;
    if (!roomId) {
      console.warn('group không có id/_id:', group);
    } else {
      group = { ...group, id: roomId }; // đảm bảo có field id
    }

    // 2) Nếu KHÔNG phải GROUP (tức DM/PERSON), đổi tên hiển thị thành fullname của peer
    const isGroup = ((group?.type || '').toUpperCase() === 'GROUP');
    if (!isGroup) {
      // listUsers / listUser: tuỳ payload
      const members: any[] = Array.isArray(group?.listUsers) ? group.listUsers
        : Array.isArray(group?.listUser)  ? group.listUser
          : [];
      const me = Number(this.currentId);
      const peerId = Number(members.find((x: any) => Number(x) !== me));
      if (peerId) {
        debugger;
        // Ưu tiên tra nhanh map, fallback sang mảng users
        const peer = this.usersById?.get(peerId) || this.users.find(u => Number(u.id) === peerId);
        const peerName = peer?.fullname || peer?.username || `User #${peerId}`;
        const peerAvatar = peer?.logoUrl || peer?.logoUrl || `User #${peerId}`;
        group = { ...group, name: peerName,avatar: peerAvatar }; // <-- ghi đè name cho UI header
      }
    }

    // 3) Mở/đưa lên đầu cửa sổ
    const key = this.groupKey(group); // nhớ groupKey nên dựa trên group.id đã chuẩn hoá
    let existed = this.openChats.find((w) => w.key === key);
    if (!existed) {
      existed = {
        key,
        type: 'group',
        data: group,
        newMessage: '',
        selectedFile: null,
        showMemberPanel: false,
        memberSearchTerm: '',
        showMenu: false,
      };
      this.openChats.push(existed);
    } else {
      // cập nhật tên hiển thị nếu là DM
      existed.data = group;
    }

    // 4) Nạp message cho đúng roomId
    const body = { id: roomId };
    this.chatService.listContent(body).subscribe((res) => {
      if (res && res.body?.responseCode === '200') {
        const messages = res.body.body || [];
        const mapped: ChatMessage[] = messages.map((m: any) => {
          const from: 'me' | 'other' = m.senderId === this.currentId ? 'me' : 'other';
          const user = this.users.find((u) => u.id === m.senderId);
          const avatarPath = user?.logoUrl || user?.avatar || '';
          const isImage = !!m.fileUrl && /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(m.fileUrl);
          return {
            from,
            text: m.content || undefined,
            time: new Date(m.createDate),
            fullname: from === 'other' ? user?.fullname : undefined,
            avatar: from === 'other' ? avatarPath : undefined,
            fileUrl: m.fileUrl || undefined,
            fileName: m.fileName || undefined,
            isImage,
          };
        });
        this.chatMessages[key] = mapped;
      }
    });

    if (!this.chatMessages[key]) this.chatMessages[key] = [];
    this.focusWindowByKey(key);
  }


  closeChatWindow(key: ChatKey) {
    const next = this.openChats.filter((w) => w.key !== key);
    const wasActive = this.activeKey === key;
    this.openChats = next;
    if (wasActive) {
      const last = this.openChats.length > 0 ? this.openChats[this.openChats.length - 1] : null;
      this.activeKey = last ? last.key : null;
    }
  }

  focusWindow(w: ChatWindow) {
    this.focusWindowByKey(w.key);
  }
  private focusWindowByKey(key: ChatKey) {
    const idx = this.openChats.findIndex((x) => x.key === key);
    if (idx > -1) {
      const win = this.openChats.splice(idx, 1)[0];
      this.openChats.push(win);
      this.activeKey = key;
    }
  }

  toggleMenu(w: ChatWindow) {
    this.openChats = this.openChats.map((x) =>
      x.key === w.key ? { ...x, showMenu: !x.showMenu } : { ...x, showMenu: false }
    );
  }

  handleEnterToSendFor(ev: KeyboardEvent, w: ChatWindow) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.sendMessageFor(w);
    }
  }

  sendMessageFor(w: ChatWindow) {
    const text = (w.newMessage || '').trim();
    const file = w.selectedFile || null;
    const hasText = text.length > 0;
    const hasFile = !!file;

    if (!hasText && !hasFile) return;

    // Lấy roomId cho group/DM
    const roomId = w.type === 'group' ? (w.data as any)?.id : w.roomId;
    if (!roomId) {
      alert('Không xác định được roomId để gửi tin nhắn.');
      return;
    }

    const key = w.key;
    if (!this.chatMessages[key]) this.chatMessages[key] = [];

    // Helper: gửi message sau khi (có thể) upload file xong
    const doSend = (fileUrl?: string, fileName?: string) => {
      const body: any = {
        roomId,
        content: text,                                   // có thể rỗng nếu chỉ gửi file
        messageType: fileUrl ? 'FILE' : 'TEXT',
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
      };

      this.chatService.chat(body).subscribe({
        next: () => {
          // Cập nhật UI
          const isImage = !!(fileUrl || fileName) && /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test((fileName || fileUrl || ''));
          this.chatMessages[key].push({
            from: 'me',
            text: hasText ? text : undefined,
            time: new Date(),
            fileUrl: fileUrl || undefined,
            fileName: fileName || undefined,
            isImage,
          });

          // Reset input
          w.newMessage = '';
          w.selectedFile = null;
        },
        error: (err) => {
          console.error('Gửi tin nhắn thất bại', err);
          alert('Gửi tin nhắn thất bại.');
        }
      });
    };

    if (hasFile && file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', '1');
      formData.append('typeId', String(roomId));

      this.mediaService.uploadMedia(formData).subscribe({
        next: (res) => {
          // Kiểm tra mã thành công (tuỳ backend của bạn)
          if (res?.responseCode && res.responseCode !== '00') {
            console.warn('Upload trả về lỗi:', res);
            alert('Upload file thất bại.');
            return;
          }

          const media = res?.body?.media;
          const rawUrl: string | undefined = media?.url;
          const fileUrl = rawUrl
            ? (rawUrl.startsWith('http') ? rawUrl : (this.url + rawUrl))
            : undefined;

          const fileName = media?.name || file.name;

          if (!fileUrl) {
            console.warn('Upload thành công nhưng không tìm thấy URL trong response', res);
            alert('Upload thành công nhưng thiếu URL file.');
            return;
          }

          // Gửi message kèm file (và text nếu có)
          doSend(fileUrl, fileName);
        },
        error: (err) => {
          console.error('Upload thất bại', err);
          alert('Upload file thất bại. Vui lòng thử lại.');
        }
      });
    } else {
      // Chỉ text
      doSend();
    }

  }


  onFileSelectedFor(ev: Event, w: ChatWindow) {
    const input = ev.target as HTMLInputElement;
    if (input.files?.length) w.selectedFile = input.files[0];
  }
  removeSelectedFileFor(w: ChatWindow) {
    w.selectedFile = null;
  }

  // ===== Member panel =====
  toggleMemberPanel(w: ChatWindow) {
    if (w.type !== 'group') return;
    const g = w.data as Group;

    // lấy member theo group
    const body = { id: g.id };
    this.chatService.findIdByChatGroupId(body).subscribe((res) => {
      if (res && res.body?.responseCode === '200') {
        this.groupMembers[g.id] = res.body.body || [];
      }
    });

    w.showMemberPanel = !w.showMemberPanel;
    w.memberSearchTerm = '';
    w.showMenu = false;
  }

  currentMembersFor(w: ChatWindow): User[] {
    if (w.type !== 'group') return [];
    const g = w.data as Group;
    const ids = new Set(this.groupMembers[g.id] || []);
    return this.users.filter((u) => ids.has(u.id));
  }

  addableUsersFor(w: ChatWindow): User[] {
    if (w.type !== 'group') return [];
    const g = w.data as Group;
    const ids = new Set(this.groupMembers[g.id] || []);
    const kw = (w.memberSearchTerm || '').trim().toLowerCase();
    return this.users
      .filter((u) => !ids.has(u.id))
      .filter((u) => (kw ? u.fullname.toLowerCase().includes(kw) : true));
  }

  private updateGroupMembers(w: ChatWindow) {
    if (w.type !== 'group') return;
    const g = w.data as Group;
    const members = Array.from(new Set(this.groupMembers[g.id] || []));

    const body = {
      id: g.id,
      name: g.name,
      listUser: members,
      companyId: this.companyId,
    };

    this.chatService.creatOrUpdateGroup(body).subscribe((res) => {
      if (res && res.body?.responseCode === '200') {
        this.getAllGroup();
        this.creatingGroup = false;
        this.groupName = '';
        this.selectedUserIds.clear();
        this.createSearchTerm = '';
      } else {
        alert('Đã có lỗi xảy ra, vui lòng thử lại ');
      }
    });
  }

  addMemberToGroupWindow(w: ChatWindow, u: User) {
    if (w.type !== 'group') return;
    const g = w.data as Group;
    const arr = this.groupMembers[g.id] || [];
    if (!arr.includes(u.id)) arr.push(u.id);
    this.groupMembers[g.id] = arr;
    this.updateGroupMembers(w);
  }

  removeMemberFromGroupWindow(w: ChatWindow, userId: number) {
    if (w.type !== 'group') return;
    const g = w.data as Group;
    const arr = (this.groupMembers[g.id] || []).filter((id) => id !== userId);
    this.groupMembers[g.id] = arr;
    this.updateGroupMembers(w);
  }

  // ====== Rename / Avatar / Delete ======
  openRenameModalFor(w: ChatWindow) {
    if (w.type !== 'group') return;
    this.activeKey = w.key;
    const g = w.data as Group;
    this.newGroupName = g.name;
    this.showRenameModal = true;
    w.showMenu = false;
  }

  saveRename() {
    if (!this.activeKey) return;
    const w = this.openChats.find((x) => x.key === this.activeKey);
    if (!w || w.type !== 'group') return;
    const g = w.data as Group;
    const name = this.newGroupName.trim();
    if (!name) return;
    g.name = name;

    const body = { id: g.id, name };
    this.chatService.changeGroupName(body).subscribe((res) => {
      if (res && res.body?.responseCode === '200') {
        this.showRenameModal = false;
      } else {
        alert('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    });
  }

  openAvatarModalFor(w: ChatWindow) {
    if (w.type !== 'group') return;
    this.activeKey = w.key;
    const g = w.data as Group;
    this.avatarPreview = g.avatar || '';
    this.avatarFile = null;
    this.showAvatarModal = true;
    w.showMenu = false;
  }

  onAvatarFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveAvatar() {
    if (!this.activeKey || !this.avatarPreview) {
      this.showAvatarModal = false;
      return;
    }
    const w = this.openChats.find((x) => x.key === this.activeKey);
    if (!w || w.type !== 'group') {
      this.showAvatarModal = false;
      return;
    }
    (w.data as Group).avatar = this.avatarPreview;
    // TODO: gọi API update avatar nếu có
    this.showAvatarModal = false;
  }

  openDeleteConfirmFor(w: ChatWindow) {
    if (w.type !== 'group') return;
    this.activeKey = w.key;
    this.showDeleteConfirm = true;
    w.showMenu = false;
  }

  confirmDeleteGroup() {
    if (!this.activeKey) return;
    const w = this.openChats.find((x) => x.key === this.activeKey);
    if (!w || w.type !== 'group') {
      this.showDeleteConfirm = false;
      return;
    }
    const g = w.data as Group;
    const body = { id: g.id };
    this.chatService.deleteGroup(body).subscribe((res) => {
      if (res && res.body?.responseCode === '200') {
        this.getAllGroup();
        this.showDeleteConfirm = false;
        // đóng cửa sổ nếu đang mở
        this.closeChatWindow(w.key);
      } else {
        alert('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    });
  }

  // ESC để đóng modals
  @HostListener('window:keydown.escape')
  onEsc() {
    this.showRenameModal = false;
    this.showAvatarModal = false;
    this.showDeleteConfirm = false;
  }

  // ====== Create group ======
  startCreateGroup() {
    this.creatingGroup = true;
    this.groupName = '';
    this.selectedUserIds.clear();
    this.createSearchTerm = '';
  }
  cancelCreateGroup() {
    this.creatingGroup = false;
  }
  toggleUserSelection(userId: number, ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.checked) this.selectedUserIds.add(userId);
    else this.selectedUserIds.delete(userId);
  }
  get usersForCreate(): User[] {
    const kw = this.createSearchTerm.trim().toLowerCase();
    if (!kw) return this.users;
    return this.users.filter((u) => u.fullname.toLowerCase().includes(kw));
  }
  createGroup() {
    if (!this.groupName.trim() || this.selectedUserIds.size === 0) return;

    // Đảm bảo bạn cũng là thành viên của nhóm
    const memberIds = Array.from(new Set([...this.selectedUserIds, this.currentId]));

    const body = {
      name: this.groupName.trim(),
      listUser: memberIds,
      companyId: this.companyId,
      type: 'GROUP',
    };

    this.chatService.creatOrUpdateGroup(body).subscribe(
      (res) => {
        if (!(res && res.body?.responseCode === '200')) {
          alert('Đã có lỗi xảy ra, vui lòng thử lại.');
          return;
        }

        // BE nên trả về ChatGroup; nếu không thì trả về id
        const resp = res.body.body;
        const roomId = resp?.id ?? resp; // hỗ trợ cả 2 kiểu payload

        if (!roomId) {
          alert('Không lấy được roomId của nhóm vừa tạo.');
          return;
        }

        // Tạo object group tạm để mở ngay cửa sổ (hoặc bạn có thể gọi getAllGroup() rồi mở sau)
        const newGroup: Group = {
          // nếu interface Group.id là number mà roomId là string => ép kiểu any cho an toàn
          id: roomId as any,
          name: resp?.name ?? body.name,
          companyId: this.companyId as any,
          listUser: resp?.listUser ?? memberIds,
          avatar: resp?.avatar,
        };

        // Mở luôn cửa sổ chat nhóm (hàm openGroupChat tự nạp lịch sử)
        this.openGroupChat(newGroup);

        // Reset form + danh sách
        this.creatingGroup = false;
        this.groupName = '';
        this.selectedUserIds.clear();
        this.createSearchTerm = '';

        // (Tuỳ chọn) Làm mới danh sách nhóm từ server
        this.getAllGroup();
      },
      (err) => {
        console.error(err);
        alert('Đã có lỗi xảy ra, vui lòng thử lại.');
      }
    );
  }

  // trackBy cho message
  trackMessage = (_: number, m: ChatMessage) =>
    m?.time instanceof Date ? `${m.time.getTime()}_${m.fileUrl || ''}` : _;
  startCreateDm() {
    this.creatingDm = true;
    this.showChatList = false;
    this.creatingGroup = false; // đảm bảo không trùng form
    this.selectedDmUserId = null;
    this.dmSearchTerm = '';
  }

  cancelCreateDm() {
    this.creatingDm = false;
  }

  get usersForDm(): User[] {
    // Ẩn chính mình khỏi danh sách
    const list = this.users.filter(u => u.id !== this.currentId);
    const kw = this.dmSearchTerm.trim().toLowerCase();
    return kw ? list.filter(u => u.fullname?.toLowerCase().includes(kw) || u.username?.toLowerCase().includes(kw)) : list;
  }

  selectDmUser(id: number) {
    this.selectedDmUserId = id;
  }

// Mở cửa sổ DM đã có roomId (nếu backend cung cấp)
  private openUserChatWithRoom(user: User, roomId?: number) {
    const key = this.userKey(user);
    let existed = this.openChats.find((w) => w.key === key);

    if (!existed) {
      existed = {
        key,
        type: 'user',
        data: user,
        newMessage: '',
        selectedFile: null,
        showMemberPanel: false,
        memberSearchTerm: '',
        showMenu: false,
        roomId: roomId,
      };
      this.openChats.push(existed);
    } else {
      existed.roomId = roomId ?? existed.roomId;
    }

    if (!this.chatMessages[key]) this.chatMessages[key] = [];
    this.focusWindowByKey(key);
  }

  createDm() {
    if (!this.selectedDmUserId) return;

    const other = this.users.find(u => u.id === this.selectedDmUserId);
    if (!other) return;

    // Nếu đã biết room DM của user này thì mở luôn
    const known = this.dmRoomIdByUser[other.id];
    if (known) {
      this.openUserChatWithRoom(other, known);
      this.creatingDm = false;
      return;
    }

    // Tên phòng ổn định (tránh trùng) – có thể đổi theo ý bạn
    const stableName = `DM_${[this.currentId, other.id].sort().join('_')}`;

    // DÙNG body này để gọi API tạo/lấy phòng DM kiểu PERSON
    const body = {
      name: stableName,
      listUser: [this.currentId, other.id],
      companyId: this.companyId,
      type: 'PERSON',               // backend của bạn đang dùng type nhóm, DM = PERSON
    };

    this.chatService.creatOrUpdateGroup(body).subscribe(
      (res) => {
        if (res && res.body?.responseCode === '200') {
          // Một số backend trả { id, ... }, một số trả thẳng id
          const roomId = res.body.body?.id ?? res.body.body;
          if (!roomId) {
            alert('Không lấy được roomId cho cuộc trò chuyện 1-1.');
            return;
          }

          this.dmRoomIdByUser[other.id] = roomId;

          // Nạp lịch sử tin nhắn (nếu có)
          this.chatService.listContent({ id: roomId }).subscribe(
            (hist) => {
              const messages = hist?.body?.body || [];
              const mapped: ChatMessage[] = messages.map((m: any) => {
                const from: 'me' | 'other' = m.senderId === this.currentId ? 'me' : 'other';
                const isImage = !!m.fileUrl && /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(m.fileUrl);
                const newGroup: Group = {
                  // nếu interface Group.id là number mà roomId là string => ép kiểu any cho an toàn
                  id: roomId as any,
                  name: from === 'other' ? other.fullname : undefined,
                  companyId: this.companyId as any,
                  listUser: [this.currentId, other.id],
                  avatar: from === 'other' ? (other.logoUrl || other.avatar || '') : undefined,
                };
                this.openGroupChat(newGroup);
                return {
                  from,
                  text: m.content || undefined,
                  time: new Date(m.createDate),
                  fullname: from === 'other' ? other.fullname : undefined,
                  avatar: from === 'other' ? (other.logoUrl || other.avatar || '') : undefined,
                  fileUrl: m.fileUrl || undefined,
                  fileName: m.fileName || undefined,
                  isImage,
                };
              });
              this.getAllGroup();

            },
            (err) => {
              console.error(err);
              // Không có lịch sử vẫn mở cửa sổ để chat
              this.openUserChatWithRoom(other, roomId);
              this.creatingDm = false;
            }
          );
        } else {
          alert('Đã có lỗi xảy ra khi tạo phòng 1-1.');
        }
      },
      (err) => {
        console.error(err);
        alert('Không thể tạo phòng 1-1. Vui lòng thử lại.');
      }
    );
  }

  isPerson(g: any): boolean {
    return (g?.type || '').toUpperCase() === 'PERSON';
  }

  dmPeerId(g: any): number | null {
    const members: any[] = Array.isArray(g?.listUsers) ? g.listUsers : [];
    if (!members.length) return null;
    const me = Number(this.currentId);
    const peer = members.find((x) => Number(x) !== me);
    return peer != null ? Number(peer) : null;
  }

  dmPeerUser(g: any): User | null {
    const pid = this.dmPeerId(g);
    if (pid == null) return null;
    return this.usersById.get(pid) || this.users.find(u => Number(u.id) === pid) || null;
  }

  dmPeerName(g: any): string {
    const u = this.dmPeerUser(g);
    if (!u) return g?.name || '(Không xác định)';
    return u.fullname || u.username || `User #${u.id}`;
  }

  dmPeerAvatar(g: any): string {
    const u = this.dmPeerUser(g);
    if (!u) return 'assets/images/icon/avatar.svg';
    // ưu tiên logoUrl từ server; nếu có base URL thì ghép
    const raw = u.logoUrl || u.avatar || '';
    return raw ? (this.url + raw) : 'assets/images/icon/avatar.svg';
  }
}
