// const { ytToStrapi } = require("../scripts/posts-cron");

const { generateQOD } = require("../scripts/qod-cron");

module.exports = {
  uploadYTVids: {
    task: ({ strapi }) => {
      /* Add your own logic here */
      // console.log('cron started at ', new Date());
      // ytToStrapi().then(() => {
      //   console.log('cron finished at ', new Date());
      // }).catch(err => {
      //   console.log('cron failed at ', new Date());
      //   console.log(err);
      // });
    },
    options: {
      rule: "17 15 * * 0-6",
    },
  },
  askQod: {
    task: ({ strapi }) => {
      console.log("cron for QOD started at ", new Date());
      generateQOD()
        .then(() => {
          console.log("cron for QOD finished at ", new Date());
        })
        .catch((err) => {
          console.log("cron for QOD failed at ", new Date());
          console.log(err);
        });
    },
    options: {
      rule: "0 5 * * *",
    },
  },
};
