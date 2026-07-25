# Documentação do Sistema - Dattebayo Restaurant POS

Esta é a documentação completa do **Dattebayo Restaurant POS**, detalhando sua arquitetura, modelo de dados, funcionalidades, fluxos de deploy e ideias para melhorias futuras.

---

## 1. Visão Geral do Sistema

O **Dattebayo Restaurant POS** é um sistema moderno de Ponto de Venda (POS) projetado para restaurantes. Ele permite a realização de pedidos, gerenciamento de estoque, monitoramento da cozinha em tempo real e visualização de relatórios financeiros.

O ecossistema é composto por:
1. **Backend & Painel Web (Monolito Spring Boot)**:
   - API REST desenvolvida em Java (Spring Boot).
   - Banco de dados relacional PostgreSQL.
   - Front-end administrativo baseado em templates **Thymeleaf** e arquivos estáticos (HTML/JS/CSS).
2. **Aplicativo Mobile (Expo / React Native)**:
   - Interface portátil destinada a garçons (lançamento de pedidos na mesa) e administradores.

---

## 2. Arquitetura e Fluxo de Dados

O diagrama abaixo ilustra como os componentes interagem entre si:

```mermaid
graph TD
    subgraph Cliente Mobile (React Native / Expo)
        A[App Garçom/Admin] -->|API REST - HTTP| B[Backend Spring Boot]
    end

    subgraph Painel Web (Thymeleaf / HTML5)
        C[Nova Venda / Caixa] -->|HTTP POST/GET| B
        D[Gerenciador do Menu] -->|HTTP REST| B
        E[Painel da Cozinha KDS] -->|Pollling HTTP| B
        F[Controle de Estoque] -->|HTTP REST| B
    end

    subgraph Backend & Infraestrutura
        B -->|JPA / Hibernate| G[(PostgreSQL)]
        H[DataInitializer] -->|Seeds/Migrations| G
    end
```

---

## 3. Principais Funcionalidades (Features)

### 3.1. Frente de Caixa e Lançamento de Pedidos (`Cashier / POS`)
* **Lançamento Rápido**: Interface para selecionar categorias, produtos, adicionar complementos/variações e enviar o pedido para a fila.
* **Variações de Produtos**: Suporte a produtos com seleção obrigatória ou opcional de variações (ex: tamanho, tipo de proteína como Salmão/Camarão).
* **Mapeamento de Combos**: Itens especiais marcados como "apenas combo" (`comboOnly = true`) não aparecem individualmente, mas podem compor combos promocionais.

### 3.2. Painel da Cozinha (KDS - Kitchen Display System)
* Fila de pedidos exibindo os itens ordenados cronologicamente.
* Alteração dinâmica de status para coordenação da equipe da cozinha:
  `PENDING (Pendente) ➔ PREPARING (Em Preparo) ➔ READY (Pronto) ➔ COMPLETED (Entregue)`.

### 3.3. Gerenciamento do Cardápio
* Cadastro de novos produtos, preços, descrições e categorias.
* Habilitação/Desabilitação rápida de itens (usando a propriedade `available` no banco de dados).
* Definição de variações de preço por escolha (ex: adicionar camarão com custo adicional).

### 3.4. Controle de Estoque (`Stock Management`)
* Cadastro de insumos e ingredientes.
* Atualização manual e controle de quantidades mínimas para alerta.

### 3.5. Relatórios Financeiros (`Sales Summary`)
* Dashboard simplificado exibindo faturamento do dia, quantidade de pedidos e gráficos básicos de desempenho de vendas.

---

## 4. Modelo de Dados (Entidades Java)

Abaixo estão descritas as principais tabelas mapeadas no banco de dados através do JPA:

1. **MenuItem**: Representa um prato ou produto vendível no cardápio.
   * Atributos: `id`, `name`, `description`, `price`, `category`, `available` (booleano), `comboOnly` (booleano).
2. **MenuItemVariation**: Variações ou acréscimos aplicados a um produto (ex: "De Salmão", "Com Camarão").
   * Atributos: `id`, `name`, `type` (`SINGLE` ou `MULTIPLE`), `additionalPrice`, `menuItem` (relacionamento).
3. **Combo**: Agrupamento de itens com valor fixo ou promocional.
4. **ComboItem**: Relaciona quais `MenuItem` fazem parte de um `Combo`.
5. **Order**: Representa um pedido realizado.
   * Atributos: `id`, `customerName`, `status` (`PENDING`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`), `totalPrice`, `createdAt`.
6. **OrderItem**: Itens contidos em um pedido específico.
7. **OrderItemVariation**: Armazena quais variações o cliente escolheu para aquele item específico do pedido.
8. **Configuration**: Configurações gerais do sistema em chave/valor armazenados no banco de dados.

---

## 5. Scripts de Inicialização e Ambientes

Para simplificar a operação em desenvolvimento e produção, existem scripts shell automatizados na raiz do projeto:

### 5.1. Desenvolvimento Local (`Local Docker Build`)
* **`restart-containers.sh`**: Reinicia os containers reconstruindo as alterações feitas no código local.
* **`reset-db.sh`**: Apaga os volumes do banco local e reinicia o ambiente com os dados de semente (seed) originais do arquivo `DataInitializer.java`.
* **`stop-containers.sh`**: Para a execução dos containers locais.

### 5.2. Deploy em Produção (Docker Hub / Cloud)
* **`push-images.sh`**: Compila os pacotes com Maven, gera as imagens Docker (`danilonicioka/dattebayo-backend`) e as envia para o Docker Hub.
* **`deploy-hub.sh`**: Executa o pull das imagens mais recentes do Docker Hub na VM e reinicia a stack utilizando o arquivo de produção `docker-compose.prod.yml`.
* **`reset-db-hub.sh`**: Apaga volumes e executa o deploy limpo em produção baixando as imagens do Docker Hub.

---

## 6. Próximos Passos e Melhorias Sugeridas

Para escalar a aplicação e melhorar a estabilidade, os seguintes tópicos devem ser considerados em futuros sprints:

1. **Segurança (Autenticação e RBAC)**:
   - Implementar Spring Security com JWT para proteger os endpoints da API REST.
   - Definir papéis (`Admin`, `Caixa`, `Garçom`, `Cozinha`) para restrição de rotas tanto na Web quanto no App Mobile.
2. **Comunicação em Tempo Real (WebSockets / SSE)**:
   - Substituir o polling do painel da cozinha por uma conexão ativa em WebSocket (ou Server-Sent Events). Assim, novos pedidos aparecem na tela instantaneamente sem requisições HTTP redundantes.
3. **Integração Estoque ➔ Vendas**:
   - Implementar decremento automático de insumos no estoque à medida que pedidos contendo receitas associadas forem completados.
   - Bloquear a venda de produtos cujos insumos estejam zerados.
4. **Impressão de Comprovante**:
   - Integrar suporte para envio de JSON ou texto para impressoras térmicas não fiscais (Bluetooth/Rede via protocolo ESC/POS) para a via da cozinha e via de fechamento do cliente.
5. **Auditoria de Pedidos**:
   - Salvar logs de transições de status com data/hora e o operador responsável para fins de auditoria e cálculo de tempo médio de preparo.
