import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventHubService } from './eventhub.service';  
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule,CommonModule,BrowserModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'eventhub-frontend';
  events: any[] = [];  
  filteredEvents: any[] = [];
  searchTerm: string = '';

  constructor(private eventHubService: EventHubService) {}  

  ngOnInit(): void {
    this.eventHubService.receiveEvents().subscribe({
      next: (event) => {
        this.events.push(event);
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error receiving events:', error);
      }
    });
  }

  applyFilter(): void {
    this.filteredEvents = this.events.filter(event => 
      JSON.stringify(event).toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSearchTermChange(): void {
    this.applyFilter();
  }
}