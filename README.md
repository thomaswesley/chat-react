
# 🍕 Charlene – Agente de Atendimento com IA para Pizzaria Pagana

[![Deploy Frontend](https://img.shields.io/badge/demo-online-brightgreen)](https://charlene.ia.thomaswesleysoftware.com.br/en/apps/chat)
[![Backend](https://img.shields.io/badge/api-nodejs-blue)](https://github.com/thomaswesley/pagana-api-node)
[![Frontend](https://img.shields.io/badge/frontend-react-61DAFB)](https://github.com/thomaswesley/pagana-react)

Sistema full stack com uma interface web de chat e um microsserviço backend que simula um **atendente virtual inteligente**, treinado para atuar com foco em **conversão de vendas** no atendimento automatizado de uma pizzaria fictícia.

➡️ **Acesse a demonstração**: [https://charlene.ia.thomaswesleysoftware.com.br/en/apps/chat](https://charlene.ia.thomaswesleysoftware.com.br/en/apps/chat)

---

## 🧠 Cenário

Simulação de um atendimento humanizado com **IA generativa**, treinada com regras comportamentais específicas. O agente, chamado **Charlene**, atua como uma atendente simpática, respeitando as restrições do cardápio e buscando incentivar a finalização do pedido.

---

## 🎯 Objetivo

- Simular um atendimento de pizzaria feito por IA.
- Avaliar a **fidelidade ao cardápio**, a **persuasão na venda** e a **naturalidade na conversa**.
- Estudar padrões de interação humana em um contexto de chatbot inteligente.

---

## 🧾 Regras de Comportamento da IA

> Todas as respostas são geradas a partir de um `systemPrompt` com regras explícitas:

### ✅ O que pode fazer
- Oferecer apenas itens do cardápio: **pizzas**, **bebidas** e **sobremesas**.
- Sugerir bebida se o cliente não pedir.
- Sugerir sobremesa se o cliente aceitar bebida.
- Insistir educadamente para concluir o pedido.
- Usar linguagem simpática, persuasiva e natural.

### ❌ O que não pode fazer
- **Não pode** oferecer itens fora do cardápio (ex: hambúrguer, promoções, cupons).
- **Não pode** sair do contexto de venda.

---

## 💬 Exemplo de Conversa Esperada

```
Cliente: Olá  
IA (Charlene): Olá! Eu me chamo Charlene 😍. Bem-vindo(a) à Pagana Pizzaria, como posso ajudar você hoje?

Cliente: Quais sabores vocês têm?  
IA: Temos Margherita, Calabresa, Portuguesa, Quatro Queijos, Pepperoni, Frango com Catupiry, Vegetariana, Mexicana, Napolitana e Bacon com Cheddar. Posso te recomendar a Calabresa, que é uma das mais pedidas?

Cliente: Quero uma pizza Portuguesa  
IA: Ótima escolha! Deseja adicionar uma bebida gelada para acompanhar? Temos refrigerantes e sucos.

Cliente: Quero uma Coca  
IA: Perfeito! Para finalizar, posso te oferecer uma sobremesa? Nosso brownie com calda de chocolate é irresistível!
```

---

## 📋 Cardápio

### 🍕 Pizzas  
Margherita, Calabresa, Portuguesa, Quatro Queijos, Pepperoni, Frango com Catupiry, Vegetariana, Mexicana, Napolitana, Bacon com Cheddar.

### 🥤 Bebidas  
Coca-Cola, Guaraná, Suco de Laranja, Suco de Uva, Suco de Abacaxi, Água Mineral, Água com Gás, Coca-Cola Zero, Guaraná Zero, Chá Gelado.

### 🍰 Sobremesas  
Brownie com calda de chocolate, Pudim, Sorvete de Creme, Torta de Limão, Petit Gateau, Cheesecake, Mousse de Maracujá, Mousse de Chocolate, Pavê, Açaí na Tigela.

---

## ⚙️ Arquitetura

### 🔁 Backend – [pagana-api-node](https://github.com/thomaswesley/pagana-api-node)
- Node.js + TypeScript
- MySQL
- API REST:
  - `POST /messages`: recebe mensagem e responde com IA.
  - `GET /messages`: retorna histórico.
- Estrutura organizada (controllers, services, models, helpers).
- Suporte a **WebSocket**.

### 💻 Frontend – [pagana-react](https://github.com/thomaswesley/pagana-react)
- React JS
- WebSocket
- Interface de chat simples e funcional.
- Mensagens do cliente e resposta em tempo real da IA.

---

## 🚀 Como Executar Localmente

### 1. Clone os repositórios:

```bash
# Backend
git clone https://github.com/thomaswesley/pagana-api-node
cd pagana-api-node
npm install
cp .env.example .env # configure o acesso ao MySQL
npm run dev
```

```bash
# Frontend
git clone https://github.com/thomaswesley/pagana-react
cd pagana-react
npm install
npm run dev
```

---

## 📦 Tecnologias Utilizadas

- **Frontend**: React, WebSocket
- **Backend**: Node.js, TypeScript, WebSocket, Express, MySQL
- **Outros**: Socket.io

---

## 📄 Variáveis de Ambiente

Exemplo de `.env`:

```env
NEXT_PUBLIC_APP_PAGANA_PIZZARIA_NODE=http://localhost:8081
```

---

Feito com ❤️ por [Thomas Wesley](https://github.com/thomaswesley)
