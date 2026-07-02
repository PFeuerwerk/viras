import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
}

@Component({
    selector: 'app-placeholder-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './placeholder-chat.html'
})
export class PlaceholderChatComponent implements OnInit {
    @Input() businessName: string | undefined = '';
    @Input() servicios: any[] | undefined = [];

    showChat = false;
    userMessage = '';
    chatHistory: ChatMessage[] = [];

    constructor() { }

    ngOnInit(): void {
        this.initBotWelcome();
    }

    private initBotWelcome(): void {
        if (this.chatHistory.length === 0) {
            this.chatHistory.push({
                text: `¡Hola! Soy el asistente virtual de ${this.businessName || 'nuestro negocio'}. ¿En qué puedo ayudarte hoy?`,
                sender: 'bot'
            });
        }
    }

    toggleChat(): void {
        this.showChat = !this.showChat;
    }

    sendMessage(): void {
        if (!this.userMessage.trim()) return;

        this.chatHistory.push({ text: this.userMessage, sender: 'user' });
        const messageToProcess = this.userMessage.toLowerCase();
        this.userMessage = '';

        setTimeout(() => {
            let botResponse = `Lo siento, no entiendo tu consulta. Puedes preguntarme por nuestros servicios o agendar una cita directamente.`;

            if (messageToProcess.includes('servicio')) {
                const titulos = this.servicios?.map(s => s.titulo).filter(t => t).join(', ');
                botResponse = `Ofrecemos: ${titulos || 'servicios profesionales de alta calidad'}.`;
            } else if (messageToProcess.includes('cita') || messageToProcess.includes('reserva')) {
                botResponse = '¡Claro! Puedes agendar pulsando el botón principal en la sección de inicio.';
            }

            this.chatHistory.push({ text: botResponse, sender: 'bot' });
        }, 1000);
    }
}
