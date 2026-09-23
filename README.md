# SBL Nursery – Shopify theme

A Shopify Online Store 2.0 theme that recreates the SBL Nursery landing page design.
Every section can be edited in the Shopify theme editor (**Online Store → Themes → Customize**),
and you can add, remove or reorder the sections there too.

## Homepage sections

| # | Section | What it does |
|---|---------|--------------|
| 1 | Header | Logo, main menu with dropdowns, search, cart count, wishlist and account icons |
| 2 | Announcement marquee | Green bar with scrolling trust messages |
| 3 | Hero slider | Full-width image slides with a yellow highlighted heading, arrows, dots, counter and autoplay |
| 4 | Category circles | Round collection images plus a "Buy Now!" card |
| 5 | Featured banner | Yellow banner with text on the left and a scrolling image gallery on the right |
| 6 | Product tabs | "Handpicked Favourites" grid with All / Plants / Seeds / Kits tabs, one collection per tab. Add to Cart works without leaving the page |
| 7 | Services banner | Image plus a yellow gradient card |
| 8 | Our story | Collage of 3 images, story text and stat boxes |
| 9 | Plant finder quiz | 4-question quiz that recommends a collection |
| 10 | Trending reels | Video cards (Shopify-hosted video, or a cover image linking to Instagram/YouTube) |
| 11 | Testimonials | Customer review cards with star ratings |
| 12 | Comparison table | "Your Monthly Green Dose": Local Nurseries vs SBL vs Others |
| 13 | Blog posts | The 3 latest articles from a blog you choose |
| 14 | FAQ | Accordion with a contact box |
| 15 | CTA banner | "Stuck with plant care? We're here to help" |
| 16 | Footer | Newsletter signup, social icons, 4 menu columns and legal links |

The theme also includes simple product, collection, cart, search, blog, article, page and 404 templates.

## Install

**Option A: connect from GitHub (recommended).**
In Shopify admin go to **Online Store → Themes → Add theme → Connect from GitHub**, then choose this
repository and branch. Changes you push to the branch will sync to the store.

**Option B: upload a zip.**
Zip the *contents* of this folder, so that `layout/`, `sections/` and the other folders are at the top level of the zip:

```sh
zip -r sbl-nursery-theme.zip layout templates sections snippets assets config locales
```

Then go to **Online Store → Themes → Add theme → Upload zip file**.

**Option C: Shopify CLI.**

```sh
shopify theme dev --store your-store.myshopify.com   # live preview
shopify theme push --unpublished                     # upload as a new theme
```

## Set up after installing

1. **Menus** (Online Store → Navigation):
   - `main-menu` holds the header links: Plants, Seeds, Garden Essentials, Gifting, Blog, Track Order. Nested links become dropdowns.
   - `footer` holds the bottom legal links.
   - Create 4 more menus (Shop, Services, About us, Help) and pick them in the Footer section.
2. **Collections**: create collections such as *Flower Creepers*, *Herbs* and *Fruit Plant*, then pick them in
   **Category circles** and in **Product tabs** (one collection per tab).
3. **Images**: upload your photos in the Hero slider, Featured banner, Services banner and Our story sections.
4. **Plant finder quiz**: in each question, write one answer per line as `Answer text | collection-handle`.
   When the quiz ends, the collection with the most votes is recommended.
5. **Comparison table**: in each row, start a value with `yes`, `no` or `~` to show ✓, ✕ or ~.
   You can add a caption after `|`, for example `no | Common issue`.
6. **Social links and colours**: go to **Theme settings**.

Until you pick real collections, images and a blog, the sections show sample placeholders, so the page never looks empty.
