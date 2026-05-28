# 🏟️ SportsRadar

A mobile application that facilitates access to sports facilities, allowing users to book pitches, gyms, and other infrastructures.

## ✨ Funcionalidades Principais

* **Exploração Inteligente:** Mapa interativo integrado com Google Places, permitindo encontrar recintos desportivos baseados na localização, raio de distância e modalidade preferida.
* **Sistema de Reservas:** Agendamento de espaços com gestão de histórico (reservas futuras e passadas) e atualizações em tempo real (pull-to-refresh).
* **Pagamentos Seguros:** Check-out integrado diretamente na aplicação através do Stripe (PaymentSheet).
* **Autenticação e Perfis:** Registo/Login seguros, gestão de perfil de utilizador com gravação de preferências (cidade e distância) e termos de privacidade.
* **Notificações:** Alertas Push e notificações por Email integradas para informar os utilizadores sobre o estado das marcações.
* **UI/UX Fluída:** Navegação por *bottom tabs*, chips horizontais para categorias, "Hero images" nos detalhes dos recintos e scroll otimizado.

## 🛠️ Tecnologias e Arquitetura

O projeto está dividido num monorepo contendo o backend e a aplicação mobile.

**Mobile (Frontend)**
* React Native (Expo)
* Context API (Gestão de Estado e Autenticação)
* Integração de Mapas

**Backend (API)**
* Node.js & Express
* MongoDB (Modelos: User, Venue, Booking, VenueExtra)
* Middleware de Segurança e Logs (Rate-Limit, Morgan)

**Integrações de Terceiros (APIs)**
* Stripe API
* Google Geolocation & Places API

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado
* Instância do MongoDB (Atlas ou Local)
* Chaves de API (Stripe, Google Cloud)
* [Expo Go](https://expo.dev/client) instalado no telemóvel (ou emulador iOS/Android)

### 1. Configurar o Backend
```bash
cd backend
npm install
# Cria um ficheiro .env na pasta backend com as variáveis necessárias (MongoDB URI, Stripe Keys, Google API Key)
npm start
