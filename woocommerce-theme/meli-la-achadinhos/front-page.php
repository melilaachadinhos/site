<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main>
    <section class="meli-hero">
        <div class="meli-hero-copy">
            <p class="meli-eyebrow"><?php esc_html_e('Dropshipping manual', 'meli-la-achadinhos'); ?></p>
            <h1><?php esc_html_e('Achadinhos importados com operação manual organizada.', 'meli-la-achadinhos'); ?></h1>
            <p>
                <?php esc_html_e('Tema profissional para WordPress/WooCommerce. Os pedidos entram na loja e você controla atendimento, compra no fornecedor e rastreio manualmente.', 'meli-la-achadinhos'); ?>
            </p>
            <div class="meli-actions">
                <a class="meli-button primary" href="<?php echo esc_url(meli_la_shop_url()); ?>"><?php esc_html_e('Ver catálogo', 'meli-la-achadinhos'); ?></a>
                <a class="meli-button secondary" href="<?php echo esc_url(meli_la_cart_url()); ?>"><?php esc_html_e('Ver carrinho', 'meli-la-achadinhos'); ?></a>
            </div>
        </div>

        <div class="meli-hero-card">
            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/meli-la-logo.png'); ?>" alt="<?php esc_attr_e('meli.la achadinhos', 'meli-la-achadinhos'); ?>">
            <div>
                <span><?php esc_html_e('Fluxo manual', 'meli-la-achadinhos'); ?></span>
                <strong><?php esc_html_e('WooCommerce recebe o pedido. Você compra no fornecedor e envia o rastreio.', 'meli-la-achadinhos'); ?></strong>
            </div>
        </div>
    </section>

    <section class="meli-flow" aria-label="<?php esc_attr_e('Fluxo manual', 'meli-la-achadinhos'); ?>">
        <article>
            <span>01</span>
            <strong><?php esc_html_e('Pedido', 'meli-la-achadinhos'); ?></strong>
            <p><?php esc_html_e('Produtos, checkout e pedidos ficam registrados na loja.', 'meli-la-achadinhos'); ?></p>
        </article>
        <article>
            <span>02</span>
            <strong><?php esc_html_e('Confirmação', 'meli-la-achadinhos'); ?></strong>
            <p><?php esc_html_e('Confirme os dados do pedido antes de seguir com a compra.', 'meli-la-achadinhos'); ?></p>
        </article>
        <article>
            <span>03</span>
            <strong><?php esc_html_e('Fornecedor', 'meli-la-achadinhos'); ?></strong>
            <p><?php esc_html_e('Compre manualmente no fornecedor escolhido.', 'meli-la-achadinhos'); ?></p>
        </article>
        <article>
            <span>04</span>
            <strong><?php esc_html_e('Rastreio', 'meli-la-achadinhos'); ?></strong>
            <p><?php esc_html_e('Cliente acompanha status e suporte pela loja.', 'meli-la-achadinhos'); ?></p>
        </article>
    </section>

    <section class="meli-products">
        <div class="meli-section-heading">
            <p class="meli-eyebrow"><?php esc_html_e('Catálogo', 'meli-la-achadinhos'); ?></p>
            <h2><?php esc_html_e('Produtos cadastrados no WooCommerce aparecem aqui.', 'meli-la-achadinhos'); ?></h2>
        </div>

        <?php if (class_exists('WooCommerce')) : ?>
            <?php echo do_shortcode('[products limit="8" columns="4" orderby="date" order="DESC"]'); ?>
        <?php else : ?>
            <div class="meli-notice">
                <?php esc_html_e('Instale e ative o WooCommerce para exibir produtos reais.', 'meli-la-achadinhos'); ?>
            </div>
        <?php endif; ?>
    </section>

    <section class="meli-manual">
        <div>
            <p class="meli-eyebrow"><?php esc_html_e('Operação manual', 'meli-la-achadinhos'); ?></p>
            <h2><?php esc_html_e('Controle os pedidos com processo simples e planilha.', 'meli-la-achadinhos'); ?></h2>
            <p>
                <?php esc_html_e('Depois que o cliente pagar, compre no fornecedor, registre o custo real, acompanhe o envio e mande o rastreio ao cliente.', 'meli-la-achadinhos'); ?>
            </p>
        </div>
    </section>
</main>

<?php
get_footer();
