<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main class="meli-shop">
    <?php woocommerce_content(); ?>
</main>

<?php
get_footer();
