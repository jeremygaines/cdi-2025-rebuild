export const helpContent = {
  countryCategories: {
    title: 'Country Categories',
    content: (
      <>
        <p>This option allows you to create a "mini-CDI" composed of countries with shared characteristics. Please select a sub-grouping of countries to compare against one another. The options are:</p>

        <h3 className="font-semibold mt-4">All</h3>
        <p>The entire set of the 38 CDI countries, including high- and middle-income countries from all continents. The full set of countries is Argentina, Australia, Austria, Belgium, Brazil, Canada, Chile, China, Czechia, Denmark, Finland, France, Germany, Greece, Hungary, India, Indonesia, Ireland, Italy, Japan, Luxembourg, Mexico, Netherlands, New Zealand, Norway, Poland, Portugal, Saudi Arabia, Slovak Republic, South Africa, South Korea, Spain, Sweden, Switzerland, Türkiye, UAE, United Kingdom, and the United States.</p>

        <h3 className="font-semibold mt-4">G20</h3>
        <p>The Group of 20 countries is an international forum for governments and central bank chiefs of 19 countries and the EU to discuss global financial and governance issues. It includes Argentina, Australia, Brazil, Canada, China, France, Germany, India, Indonesia, Italy, Japan, Mexico, Russia, Saudi Arabia, South Africa, South Korea, Türkiye, United Kingdom, and the United States.</p>

        <h3 className="font-semibold mt-4">BRICS</h3>
        <p>The BRICS group was identified in the early 2000s as spearheading the growing influence of emerging global economies. Membership expanded from the original five members—Brazil, Russia, India, China, and South Africa—to 10 in 2024 and 2025, including two more CDI countries: Indonesia and the United Arab Emirates.</p>

        <h3 className="font-semibold mt-4">Organization for Economic Co-operation and Development (OECD)</h3>
        <p>The OECD is an intergovernmental economic organisation that provides a forum for international economic policy matters, governance issues, and promoting the market economy and democracy. Generally regarded as a "rich-country club," its members are generally high-income with high Human Development scores and are regarded as developed countries. The 31 OECD members within the CDI are Australia, Austria, Belgium, Canada, Chile, Czech Republic, Denmark, Finland, France, Germany, Greece, Hungary, Ireland, Israel, Italy, Japan, Luxembourg, Mexico, Netherlands, New Zealand, Norway, Poland, Portugal, Slovak Republic, South Korea, Spain, Sweden, Switzerland, Türkiye, United Kingdom, and the United States.</p>

        <h3 className="font-semibold mt-4">Middle Income</h3>
        <p>Eight countries in the CDI that are classed as either lower or upper middle income according to the OECD's <a href="https://www.oecd.org/en/topics/sub-issues/oda-eligibility-and-conditions/dac-list-of-oda-recipients.html#oda-recipients-list" target="_blank" rel="noopener noreferrer" className="text-cdi-primary underline">classification</a> by income. These are Argentina, Brazil, China, India, Indonesia, Mexico, South Africa, and Türkiye.</p>
      </>
    ),
  },

  incomeAdjusted: {
    title: 'Income-adjusted Rankings',
    content: (
      <>
        <p>A country's contribution to international development is expected to go up as it becomes richer—but by how much? CDI scores already adjust for the size of a country, but the income-adjusted ranking shows scores and ranks after taking account of a country's average income-level.</p>

        <p>To calculate an income-adjusted score, we measure whether a country scores above or below an expected CDI score based on the relationship between all countries' scores on that component and their income level (as measured by GNI per capita). The expected CDI score is calculated using a line of best fit using ordinary least squares regression (OLS). We then calculate a country's income-adjusted score as the distance from this expected score: it is the (positive or negative) deviation from that expected score line.</p>
      </>
    ),
  },

  developmentFinance: {
    title: 'Development Finance',
    content: (
      <>
        <p>Development finance is likely the first policy area that comes to mind when considering how countries help to promote development beyond their borders. It remains an important source of assistance for many developing countries. We use a measure of the <strong>quantity</strong> which is comparable across the countries we assess alongside a suite of measures which assess the quality of that finance in promoting development. Many of the higher-income countries we assess agreed to the UN resolution to spend 0.7 percent of national income on development assistance originally. More than 50 years after it was set, only a handful of countries are meeting this target.</p>
      </>
    ),
  },

  exchange: {
    title: 'Exchange',
    content: (
      <>
        <p>This policy area measures the way in which countries manage the international flows of capital, goods and services, ideas, and people. Borders, distance and above all the policies of richer countries still impede economic and people-to-people exchanges, which could have huge potential to both accelerate development and growth both at home and internationally.</p>

        <p>Integration in trade, investment, and global value chains helps drive mutual economic growth and reduce poverty. Meanwhile, migration provides opportunities to obtain skills, contacts, and capital for the citizens of each country.</p>
      </>
    ),
  },

  globalPublicGoods: {
    title: 'Global Public Goods',
    content: (
      <>
        <p>In this policy area we assess how countries act to collectively solve global public goods problems. Global public goods are non-excludable and non-rival. This means that while all countries benefit, no country can claim sole ownership (or sole credit) for advancements in areas such as the climate and environment, the global pool of knowledge, or global peace and health.</p>

        <p>In practice this means two things: firstly, there are strong temptations for countries to free-ride on others' contributions. Secondly, there are few incentives to act alone to solve global public good problems when they arise. No country alone can stop a pandemic from spreading, halt climate change, or produce all new knowledge. Therefore, we give credit to countries which take the initiative to work on these issues of global importance.</p>
      </>
    ),
  },
};

export type HelpContentKey = keyof typeof helpContent;
