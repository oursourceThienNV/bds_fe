import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import {ApiUrl} from "../../../shared/constant/ApiUrl.constant";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  // @ts-ignore
  private stompClient: Stomp.Client;
  private statsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private api: ApiUrl) { }

  // Kết nối đến WebSocket
  connect(storeId: number) {
    const token = localStorage.getItem('authData');

    const socket = new SockJS(this.api.getCatalogApi() + "/ws");
    this.stompClient = Stomp.over(socket);  // ⚠️ BẮT BUỘC CÓ DÒNG NÀY TRƯỚC KHI connect

    this.stompClient.connect(
      { Authorization: "Bearer " + token }, // GỬI TOKEN
      frame => {
        console.log('Connected: ' + frame);

        this.stompClient.subscribe(`/user/queue/stats/${storeId}`, message => {
          let stats;
          try {
            stats = JSON.parse(message.body);
          } catch (e) {
            stats = message.body;
          }
          this.statsSubject.next(stats);
        });
      },
      error => {
        console.error('STOMP connection error:', error);
      }
    );
  }
  // Hủy bỏ kết nối WebSocket
  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }

  // Dữ liệu thống kê (openOrdersCount, processingOrdersCount)
  getStats() {
    return this.statsSubject.asObservable();  // Observable cho việc subscribe
  }
}
