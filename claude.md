# Claude project instructions for CDI rebuild

## Background on project

The Center for Global Development, my organization, has a major project called the Commitment to Development Index (CDI). It's a ranking of several dozen countries that's published every year that assesses how their policies contribute to international development. There is one master score which is based on seven main components, including trade policies, climate policies, development finance, etc. The score in each of those seven main categories, in turn, is based on a number of sub-indicators. The main page shows the scores for each country, and then you can click a country to expand more information and go into a separate page for it with a more detailed report. Similarly you can click on each of the column headings to go into a separate page with a more detailed exploration of that component and the indicators that make it up. All the interactivity consists of basic filtering options for the data and the ability to expand/contract certain areas, no recalculations or anything complicated.

Right now this project is built as a Vue app that is hosted on the larger Drupal server for our site, and which uses the Drupal site's database for data and the site's stylesheet for certain styles. This makes it quite fragile and difficult to work with. I'd like to rebuild it as a standalone static vue app that can be hosted somewhere like Vercel or Cloudflare Pages.

## reference materials
This folder contains a couple of screenshots of the main page of the app

## data
This includes a number of CSVs with data for different parts of the tool. It includes the scores for the main page, as well as a great deal of data for subindicators that will be used on the more detailed country and component reports. It does not include all the text that will be present on those more detailed sub-pages--for now just use placeholder data.

## site_code_backup
This is a full download of our current website's drupal code from pantheon. inside this folder on the path /web/modules/custom/cdi_admin seems to be a module containing some of the relevant build code for the existing vue app