<?php
/**
 * Theme setup for meli.la achadinhos.
 */

if (!defined('ABSPATH')) {
    exit;
}

function meli_la_setup(): void
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');

    register_nav_menus([
        'primary' => __('Menu principal', 'meli-la-achadinhos'),
    ]);
}
add_action('after_setup_theme', 'meli_la_setup');

function meli_la_assets(): void
{
    $theme_version = wp_get_theme()->get('Version');

    wp_enqueue_style(
        'meli-la-store',
        get_template_directory_uri() . '/assets/css/store.css',
        [],
        $theme_version
    );

    wp_enqueue_script(
        'meli-la-theme',
        get_template_directory_uri() . '/assets/js/theme.js',
        [],
        $theme_version,
        true
    );
}
add_action('wp_enqueue_scripts', 'meli_la_assets');

function meli_la_cart_count(): int
{
    if (!function_exists('WC') || !WC()->cart) {
        return 0;
    }

    return WC()->cart->get_cart_contents_count();
}

function meli_la_shop_url(): string
{
    if (function_exists('wc_get_page_permalink')) {
        return wc_get_page_permalink('shop');
    }

    return home_url('/');
}

function meli_la_cart_url(): string
{
    if (function_exists('wc_get_cart_url')) {
        return wc_get_cart_url();
    }

    return home_url('/');
}

function meli_la_checkout_url(): string
{
    if (function_exists('wc_get_checkout_url')) {
        return wc_get_checkout_url();
    }

    return home_url('/');
}

function meli_la_woocommerce_button_text(): string
{
    return __('Adicionar', 'meli-la-achadinhos');
}
add_filter('woocommerce_product_add_to_cart_text', 'meli_la_woocommerce_button_text');
add_filter('woocommerce_product_single_add_to_cart_text', 'meli_la_woocommerce_button_text');
