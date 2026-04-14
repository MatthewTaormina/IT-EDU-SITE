import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * webdevSidebar mirrors the intended reading order of the Web Development
 * pathway: Pathway → Course → Unit → (Sub-unit →) Lessons → Review.
 *
 * Each parent node uses `link: { type: 'doc' }` so that Docusaurus treats
 * it as a real page in the DFS sequence. This makes the "Next" button go
 * from a parent page into its first child, and from the last child into
 * the next parent — i.e. correct depth-first reading order.
 *
 * articlesSidebar is kept separately because articles are standalone and
 * are not part of any course pathway.
 */
const sidebars: SidebarsConfig = {
  webdevSidebar: [
    {
      type: 'category',
      label: 'Web Developer: Zero to Employable',
      link: { type: 'doc', id: 'Pathways/webdev_beginner/index' },
      items: [
        {
          type: 'category',
          label: 'Web Development',
          link: { type: 'doc', id: 'Courses/webdev/index' },
          items: [
            // ── Unit 00: Web Foundations ─────────────────────────────────
            {
              type: 'category',
              label: 'Web Foundations',
              link: { type: 'doc', id: 'Units/webdev_00_web_foundations/index' },
              items: [
                'Lessons/webdev_00_web_foundations_01_the_internet',
                'Lessons/webdev_00_web_foundations_02_the_web',
                'Lessons/webdev_00_web_foundations_03_web_browsers',
                'Lessons/webdev_00_web_foundations_04_web_servers',
                'Lessons/webdev_00_web_foundations_05_urls',
                'Lessons/webdev_00_web_foundations_06_http',
                'Lessons/webdev_00_web_foundations_07_dns',
                'Lessons/webdev_00_web_foundations_08_core_technologies',
                'Lessons/webdev_00_web_foundations_09_how_a_page_loads',
                'Units/webdev_00_web_foundations/review',
              ],
            },
            // ── Unit 01: HTML ─────────────────────────────────────────────
            {
              type: 'category',
              label: 'HTML',
              link: { type: 'doc', id: 'Units/webdev_01_html/index' },
              items: [
                'Lessons/webdev_01_html_01_document_structure',
                'Lessons/webdev_01_html_02_the_dom_revisited',
                'Lessons/webdev_01_html_03_text_elements',
                'Lessons/webdev_01_html_04_links_and_navigation',
                'Lessons/webdev_01_html_05_images_and_media',
                'Lessons/webdev_01_html_06_lists',
                'Lessons/webdev_01_html_07_tables',
                'Lessons/webdev_01_html_08_forms',
                'Lessons/webdev_01_html_09_semantic_html',
                'Lessons/webdev_01_html_10_the_head',
                'Lessons/webdev_01_html_11_accessibility_basics',
                'Lessons/webdev_01_html_12_putting_it_together',
                'Units/webdev_01_html/review',
              ],
            },
            // ── Unit 02: CSS ──────────────────────────────────────────────
            {
              type: 'category',
              label: 'CSS',
              link: { type: 'doc', id: 'Units/webdev_02_css/index' },
              items: [
                {
                  type: 'category',
                  label: 'CSS Foundations',
                  link: { type: 'doc', id: 'Units/webdev_02_css_01_foundations/index' },
                  items: [
                    'Lessons/webdev_02_css_01_foundations_01_how_css_works',
                    'Lessons/webdev_02_css_01_foundations_02_syntax_and_rules',
                    'Lessons/webdev_02_css_01_foundations_03_the_cascade',
                    'Units/webdev_02_css_01_foundations/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'Selectors & Specificity',
                  link: { type: 'doc', id: 'Units/webdev_02_css_02_selectors/index' },
                  items: [
                    'Lessons/webdev_02_css_02_selectors_01_type_class_id',
                    'Lessons/webdev_02_css_02_selectors_02_combinators',
                    'Lessons/webdev_02_css_02_selectors_03_pseudo_classes',
                    'Lessons/webdev_02_css_02_selectors_04_pseudo_elements',
                    'Lessons/webdev_02_css_02_selectors_05_specificity',
                    'Units/webdev_02_css_02_selectors/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'The Box Model',
                  link: { type: 'doc', id: 'Units/webdev_02_css_03_box_model/index' },
                  items: [
                    'Lessons/webdev_02_css_03_box_model_01_content_padding_border_margin',
                    'Lessons/webdev_02_css_03_box_model_02_box_sizing',
                    'Lessons/webdev_02_css_03_box_model_03_display_and_flow',
                    'Units/webdev_02_css_03_box_model/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'Layout',
                  link: { type: 'doc', id: 'Units/webdev_02_css_04_layout/index' },
                  items: [
                    {
                      type: 'category',
                      label: 'Flexbox',
                      link: { type: 'doc', id: 'Units/webdev_02_css_04_layout_01_flexbox/index' },
                      items: [
                        'Lessons/webdev_02_css_04_layout_01_flexbox_01_flex_container',
                        'Lessons/webdev_02_css_04_layout_01_flexbox_02_flex_items',
                        'Lessons/webdev_02_css_04_layout_01_flexbox_03_alignment',
                        'Lessons/webdev_02_css_04_layout_01_flexbox_04_common_patterns',
                        'Units/webdev_02_css_04_layout_01_flexbox/review',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Grid',
                      link: { type: 'doc', id: 'Units/webdev_02_css_04_layout_02_grid/index' },
                      items: [
                        'Lessons/webdev_02_css_04_layout_02_grid_01_grid_container',
                        'Lessons/webdev_02_css_04_layout_02_grid_02_grid_items',
                        'Lessons/webdev_02_css_04_layout_02_grid_03_template_areas',
                        'Lessons/webdev_02_css_04_layout_02_grid_04_common_patterns',
                        'Units/webdev_02_css_04_layout_02_grid/review',
                      ],
                    },
                  ],
                },
                {
                  type: 'category',
                  label: 'Typography & Colour',
                  link: { type: 'doc', id: 'Units/webdev_02_css_05_typography_and_colour/index' },
                  items: [
                    'Lessons/webdev_02_css_05_typography_and_colour_01_typography',
                    'Lessons/webdev_02_css_05_typography_and_colour_02_colour_and_background',
                    'Lessons/webdev_02_css_05_typography_and_colour_03_custom_properties',
                    'Units/webdev_02_css_05_typography_and_colour/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'Responsive Design',
                  link: { type: 'doc', id: 'Units/webdev_02_css_06_responsive/index' },
                  items: [
                    'Lessons/webdev_02_css_06_responsive_01_viewport',
                    'Lessons/webdev_02_css_06_responsive_02_media_queries',
                    'Lessons/webdev_02_css_06_responsive_03_fluid_sizing',
                    'Units/webdev_02_css_06_responsive/review',
                  ],
                },
                'Units/webdev_02_css/review',
              ],
            },
            // ── Unit 03: JavaScript Basics ────────────────────────────────
            {
              type: 'category',
              label: 'JavaScript Basics',
              link: { type: 'doc', id: 'Units/webdev_03_js_basics/index' },
              items: [
                {
                  type: 'category',
                  label: 'JS Foundations',
                  link: { type: 'doc', id: 'Units/webdev_03_js_basics_01_foundations/index' },
                  items: [
                    'Lessons/webdev_03_js_basics_01_foundations_01_introduction',
                    'Lessons/webdev_03_js_basics_01_foundations_02_variables_and_data_types',
                    'Lessons/webdev_03_js_basics_01_foundations_03_operators',
                    'Units/webdev_03_js_basics_01_foundations/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'Control Flow',
                  link: { type: 'doc', id: 'Units/webdev_03_js_basics_02_control_flow/index' },
                  items: [
                    'Lessons/webdev_03_js_basics_02_control_flow_01_conditionals',
                    'Lessons/webdev_03_js_basics_02_control_flow_02_loops',
                    'Lessons/webdev_03_js_basics_02_control_flow_03_switch',
                    'Units/webdev_03_js_basics_02_control_flow/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'Functions',
                  link: { type: 'doc', id: 'Units/webdev_03_js_basics_03_functions/index' },
                  items: [
                    'Lessons/webdev_03_js_basics_03_functions_01_function_declarations',
                    'Lessons/webdev_03_js_basics_03_functions_02_arrow_functions',
                    'Lessons/webdev_03_js_basics_03_functions_03_scope_and_closures',
                    'Units/webdev_03_js_basics_03_functions/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'Data Structures',
                  link: { type: 'doc', id: 'Units/webdev_03_js_basics_04_data_structures/index' },
                  items: [
                    'Lessons/webdev_03_js_basics_04_data_structures_01_arrays',
                    'Lessons/webdev_03_js_basics_04_data_structures_02_objects',
                    'Lessons/webdev_03_js_basics_04_data_structures_03_json',
                    'Units/webdev_03_js_basics_04_data_structures/review',
                  ],
                },
                {
                  type: 'category',
                  label: 'The DOM',
                  link: { type: 'doc', id: 'Units/webdev_03_js_basics_05_the_dom/index' },
                  items: [
                    'Lessons/webdev_03_js_basics_05_the_dom_01_dom_selection',
                    'Lessons/webdev_03_js_basics_05_the_dom_02_dom_manipulation',
                    'Lessons/webdev_03_js_basics_05_the_dom_03_events',
                    'Units/webdev_03_js_basics_05_the_dom/review',
                  ],
                },
              ],
            },
            // ── Capstone Project ──────────────────────────────────────────
            {
              type: 'category',
              label: 'Capstone — Personal Portfolio',
              link: { type: 'doc', id: 'Projects/webdev_capstone_portfolio/index' },
              items: [
                'Projects/webdev_capstone_portfolio/brief',
                'Projects/webdev_capstone_portfolio/requirements',
                'Projects/webdev_capstone_portfolio/starter_kit',
              ],
            },
          ],
        },
      ],
    },
  ],

  articlesSidebar: [{ type: 'autogenerated', dirName: 'Articles' }],
};

export default sidebars;
