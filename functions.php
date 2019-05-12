<?php
/**
 * Theme functions and definitions
 *
 * @package corporate_bizplan
 */

if ( ! function_exists( 'corporate_bizplan_enqueue_styles' ) ) :
	/**
	* @since Businex Corporate 1.0.0
	*/
	function corporate_bizplan_enqueue_styles() {
		wp_enqueue_style( 'corporate_bizplan-style-parent', get_template_directory_uri() . '/style.css' );
		wp_enqueue_style( 'corporate_bizplan-style', get_stylesheet_directory_uri() . '/style.css', array( 'corporate_bizplan-style-parent' ), '1.0.0' );
	}
endif;
add_action( 'wp_enqueue_scripts', 'corporate_bizplan_enqueue_styles', 99 );