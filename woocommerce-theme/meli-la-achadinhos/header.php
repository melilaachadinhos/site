<?php
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div class="meli-announcement">
    <span><?php esc_html_e('Frete rastreado acima de R$199', 'meli-la-achadinhos'); ?></span>
    <span><?php esc_html_e('Curadoria de achadinhos premium', 'meli-la-achadinhos'); ?></span>
    <span><?php esc_html_e('Pedidos e fornecedores controlados manualmente', 'meli-la-achadinhos'); ?></span>
</div>

<header class="meli-header">
    <a class="meli-brand" href="<?php echo esc_url(home_url('/')); ?>">
        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/meli-la-logo.png'); ?>" alt="<?php esc_attr_e('meli.la achadinhos', 'meli-la-achadinhos'); ?>">
        <span><?php bloginfo('name'); ?></span>
    </a>

    <nav class="meli-nav" aria-label="<?php esc_attr_e('Navegação principal', 'meli-la-achadinhos'); ?>">
        <?php
        wp_nav_menu([
            'theme_location' => 'primary',
            'container' => false,
            'fallback_cb' => false,
            'items_wrap' => '%3$s',
        ]);
        ?>
        <a href="<?php echo esc_url(meli_la_shop_url()); ?>"><?php esc_html_e('Catálogo', 'meli-la-achadinhos'); ?></a>
        <a href="<?php echo esc_url(meli_la_cart_url()); ?>"><?php esc_html_e('Carrinho', 'meli-la-achadinhos'); ?></a>
        <a href="<?php echo esc_url(meli_la_checkout_url()); ?>"><?php esc_html_e('Checkout', 'meli-la-achadinhos'); ?></a>
    </nav>

    <a class="meli-cart" href="<?php echo esc_url(meli_la_cart_url()); ?>" aria-label="<?php esc_attr_e('Abrir carrinho', 'meli-la-achadinhos'); ?>">
        <span class="meli-cart-icon" aria-hidden="true"></span>
        <strong><?php echo esc_html((string) meli_la_cart_count()); ?></strong>
    </a>
</header>
