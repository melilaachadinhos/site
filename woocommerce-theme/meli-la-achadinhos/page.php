<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main class="meli-page">
    <?php
    while (have_posts()) :
        the_post();
        ?>
        <article <?php post_class('meli-content'); ?>>
            <h1><?php the_title(); ?></h1>
            <?php the_content(); ?>
        </article>
    <?php endwhile; ?>
</main>

<?php
get_footer();
