import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { KafkaConsumerService } from './kafka-consumer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'kafka-consumer';
  messages: string[] = [];

  constructor(private kafkaConsumerService: KafkaConsumerService) {}

  ngOnInit() {
    this.kafkaConsumerService.getMessages().subscribe(
      (data: string[]) => {
        this.messages = data;
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }
}