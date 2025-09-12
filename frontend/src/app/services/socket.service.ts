// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// // import default instead of { io }
// import io from 'socket.io-client';

// @Injectable({
//   providedIn: 'root'
// })
// export class SocketService {
//   private socket: any;

//   constructor() {
//     // just call the default function
//     this.socket = io('http://localhost:3000');
//   }

//   onEvent(event: string): Observable<any> {
//     return new Observable(observer => {
//       this.socket.on(event, (data: any) => observer.next(data));
//       return () => this.socket.off(event);
//     });
//   }

//   emitEvent(event: string, data: any) {
//     this.socket.emit(event, data);
//   }
// }


import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
// import { io, Socket } from 'socket.io-client';
 import io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket: any;

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => console.log('✅ Socket connected:', this.socket.id));

    // ✅ Explicitly type "reason" as string
    this.socket.on('disconnect', (reason: string) => {
      console.warn('⚠️ Socket disconnected:', reason);
    });
  }

  onEvent<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      this.socket.on(event, (data: T) => observer.next(data));
      return () => this.socket.off(event);
    });
  }

  emitEvent(event: string, data: any) {
    if (this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event, socket disconnected');
    }
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
