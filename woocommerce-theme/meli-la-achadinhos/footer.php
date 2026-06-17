<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<footer class="meli-footer">
    <div>
        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/meli-la-logo.png'); ?>" alt="">
        <strong><?php bloginfo('name'); ?></strong>
    </div>
    <p>
        <?php esc_html_e('Loja WooCommerce para dropshipping manual. Configure políticas, domínio, fornecedores e rastreio antes de vender oficialmente.', 'meli-la-achadinhos'); ?>
    </p>
</footer>

<?php wp_footer(); ?>
</body>
</html>
