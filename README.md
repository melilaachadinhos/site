# meli.la achadinhos - loja dropshipping manual

Esta pasta contém uma vitrine profissional e responsiva para validar a marca **meli.la achadinhos** e uma estrutura simples para operar dropshipping manualmente.

O fluxo manual é: cliente compra no site, você pega os dados de entrega, compra no fornecedor, registra o custo, envia o rastreio e acompanha o suporte.

Os pedidos gerados no formulário ficam preparados para envio ao WhatsApp da loja: `+55 41 98468-4382`.

## Arquivos principais

- `index.html`: loja estática para apresentação da marca, carrinho e formulário de entrega.
- `assets/css/styles.css`: visual, layout responsivo e identidade da prévia.
- `assets/js/app.js`: catálogo, busca, filtros e carrinho demonstrativo.
- `woocommerce-theme/meli-la-achadinhos/`: tema WordPress opcional para usar com WooCommerce, se você decidir evoluir para uma plataforma.
- `woocommerce-products-seed.csv`: CSV opcional para criar produtos demonstrativos no WooCommerce.
- `assets/img/`: logo e imagens dos produtos.
- `GUIA-DROPSHIPPING-MANUAL.md`: passo a passo para operar manualmente.
- `controle-produtos-manual.csv`: controle de produtos, fornecedores, custos e preços.
- `controle-pedidos-manual.csv`: controle de pedidos, atendimento, compra e rastreio.

## Como usar a prévia

Abra o arquivo `index.html` no navegador. A loja não precisa de servidor local.

## Como operar manualmente

1. Cliente escolhe produtos e preenche o endereço.
2. O resumo do pedido é enviado para o WhatsApp da loja.
3. Registre o pedido em `controle-pedidos-manual.csv`.
4. Compre manualmente no fornecedor escolhido usando os dados do cliente.
5. Atualize o pedido com custo real, lucro e código de rastreio.
6. Envie o rastreio ao cliente por e-mail ou WhatsApp e acompanhe até a entrega.

## Uso opcional com WooCommerce

Se quiser evoluir para uma plataforma completa no futuro, instale WordPress + WooCommerce e use a pasta `woocommerce-theme/meli-la-achadinhos`. Por agora, a operação principal fica no site estático com formulário e atendimento pelo WhatsApp.

## Personalização rápida da prévia

1. No arquivo `assets/js/app.js`, preencha `whatsappPhone` com DDD e número, exemplo: `"11999999999"`.
2. Substitua custos, preços e descrições no array `products`.
3. Preencha os links reais dos fornecedores em `controle-produtos-manual.csv`.
4. Use o `GUIA-DROPSHIPPING-MANUAL.md` para manter o processo organizado.

## Observação comercial

Antes de vender oficialmente, ajuste CNPJ, políticas de troca, prazo real de entrega, domínio, e-mails transacionais e regras da plataforma escolhida.
