const { ytToStrapi } = require("../scripts/posts-cron");

module.exports = {
  uploadYTVids: {
    task: ({ strapi }) => {
      /* Add your own logic here */
      console.log('cron started at ', new Date());
      ytToStrapi().then(() => {
        console.log('cron finished at ', new Date());
      }).catch(err => {
        console.log('cron failed at ', new Date());
        console.log(err);
      });
    },
    options: {
      rule: "22 20 * * 0-6",
      // rule: "* * * * *",
      timezone: 'Asia/Karachi'
    },
  },
};