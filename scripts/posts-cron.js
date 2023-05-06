const {google} = require('googleapis');
const { default: axios } = require('axios');
const { default: axiosRetry } = require('axios-retry')
const createCWALogger = require('../utils/logger');
require('dotenv').config()
const qs = require('qs');
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.STRAPI_API_KEY}`
const slug = async (...args) => await import('github-slugger').then(({default: slug}) => new slug(...args));
const logger = createCWALogger('yt-posts-cron');
const strapiBaseUrl = process.env['STRAPI_API_BASE_URL'];
const MESSAGE_DELAY_IN_SECONDS = 1000 * 60 * 5; // 5 minutes

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 3 });

const youtube = google.youtube({
  version: 'v3',
  auth: process.env['YT_API_KEY'],
});

async function fetchPlaylistVideos(playlistId, nextPToken = '') {
  const config = {
    part: 'snippet',
    playlistId,
    maxResults: 50, // You can increase this up to 50
  };

  if(nextPToken) {
    config.pageToken = nextPToken;
  }

  const response = await youtube.playlistItems.list(config);
  let items = [];
  const {nextPageToken} = response.data;
  items = response.data.items || [];
  if (nextPageToken) {
    items = [...items, ...(await fetchPlaylistVideos(playlistId, nextPageToken))]
  }
  return items;
}

const ytToStrapi = async () => {
  const query = qs.stringify(
    {
      populate: ['chapter', 'lastCreatedPost', 'course'],
    },
    {
      encodeValuesOnly: true,
    }
  )
  const cronChapResp = await axios.get(`${strapiBaseUrl}/api/cron-chapter?${query}`);
  const cronVideo = cronChapResp.data.data.attributes;
  const {playlistId} = cronVideo; 
  const chapter = cronVideo.chapter.data;
  const course = cronVideo.course.data;
  const lastCreatedPost = cronVideo.lastCreatedPost?.data?.attributes;
  const embeddedContent = lastCreatedPost?.videoEmbedded ? JSON.parse(lastCreatedPost.videoEmbedded) : {}
  const lastVideoId = cronVideo.lastCreatedPost?.data?.id;
  const lastVideoYTId = getVideoId(embeddedContent?.url || lastCreatedPost.videoUrl || '')
  const playlistVideos = await fetchPlaylistVideos(playlistId);
  const bannanaSlug = (await slug())
  const courseSlug = `https://codewithahsan.dev/courses/${course.attributes.slug}`
  
  let cursor = false
  let orderCursor = Number(lastCreatedPost?.order || 0);
  let newVideos = playlistVideos
    .filter((video) => {
      const {videoId} = video.snippet.resourceId;
      const {title} = video.snippet;
      if (title.toLowerCase() === 'private video') {
        return false;
      }
      if (lastVideoYTId === videoId) {
        cursor = true;
        return false;
      }
      return cursor
    }).map(vid => {
      const title = vid.snippet.title.replace(' | Web Development Basics Course', '');
      const slugForPost = bannanaSlug.slug(title)
      return {
        ...vid.snippet,
        title,
        order: (++orderCursor).toString(),
        slug: slugForPost,
      }
    });

  logger.debug({
    newVideos
  })
  let newLastVideoId;
  if (newVideos.length > 0) {
    const responses = await Promise.all(
      newVideos.map(video => {
        const postData = {
          title: video.title,
          description: video.description.replaceAll(/(⭐ Follow the course).[\s\S]+/g, ''),
          videoUrl: `https://www.youtube.com/watch?v=${video.resourceId.videoId}`,
          order: video.order,
          slug: video.slug,
          thumbnail: video.thumbnails?.standard.url,
          type: 'video',
          chapter: {
            connect: [chapter.id]
          }
        }
        logger.debug({postData})
        return createPost(postData)
      })
    )
    const lastPost = responses.at(-1);
    logger.debug({responses});
    logger.debug(lastPost)
    newLastVideoId = lastPost.id;
    logger.debug ({lastVideoId})
    await updateLastPostInStrapi(lastVideoId, newLastVideoId);
    const postsUrls = responses.map(post => {
      return `${courseSlug}/${post.attributes.slug}`
    })
    logger.debug({
      postsUrls
    })
    await sendMessageToDiscord(postsUrls)
  }
  logger.debug('done')
}


const createPost = async (postData) => {
  logger.debug('making API call for ' + postData.slug)
  let resp;
  try {
    resp = await axios.post(`${strapiBaseUrl}/api/posts`, {
      data: {
        ...postData
      }
    })
    logger.debug({resp: resp.data.data})
  } catch (e) {
    logger.error(e)
  }
  return resp.data.data;
}

const getVideoId = (originalUrl) => {
  if (!originalUrl) {
    return
  }
  let vidUrl = ''
  let videoParams = ''
  try {
    if (originalUrl.includes('youtube') || originalUrl.includes('youtu.be')) {
      vidUrl = `https://www.youtube.com/embed/`
      videoParams = originalUrl.includes('youtube')
        ? originalUrl.split('watch?v=')[1]
        : originalUrl.split('youtu.be/')[1]

      if (videoParams.includes('&')) {
        const [videoId] = videoParams.split('&')
        return videoId;
      }
      return videoParams;
    }
    return vidUrl
  } catch (e) {
    logger.error(e, this)
  }
}

const sendMessageToDiscord = async (postsUrls, delayTime) => {
  await delay(delayTime || MESSAGE_DELAY_IN_SECONDS);
  const webhookURL = process.env.DISCORD_WEBHOOK;
  try {
    await axios.post(webhookURL, {
      content: `@everyone 📢 New lectures available on the CodeWithAhsan site 🚀\n\n${postsUrls.join('\n')}`,
      username: 'CodeWithAhsan'
    })
    logger.debug('posted to discord successfully');
  } catch (e) {
    logger.error('error posting message to discord: ', e);
  }
}

const updateLastPostInStrapi = async (lastVidOldId, lastVidnewId) => {
  try {
    const resp = await axios.put(`${strapiBaseUrl}/api/cron-chapter`, {
      data: {
        lastCreatedPost: {
          connect: [lastVidnewId],
          disconnect: [lastVidOldId]
        }
      }
    })
    logger.debug({resp: resp.data.data})
  } catch (e) {
    logger.error('Error updating last post in strapi: ', e);
  }
}

const delay = (delayTime = 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, delayTime)
  })
}

module.exports = {
  ytToStrapi
}