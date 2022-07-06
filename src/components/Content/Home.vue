<template>
  <div id="home-container">
    <h4 id="posts-title">Recent news</h4>
    <div id="posts-container">
      <div v-for="post in posts" v-bind:key="post.url" class="post-container">
        <div class="post-image-container">
          <img
            :src="post.imageUrl"
            width="400"
            height="170"
            draggable="false"
            class="post-image"
            alt="Post Image"
          />
        </div>
        <p class="post-description">{{ post.description }}</p>
        <div id="post-bottom-container">
          <div class="post-author-container">
            <p class="post-author">
              <normal style="opacity: 0.7; font-weight: 100; letter-spacing: 0.2px;">Posted by </normal>
              <img
                :src="post.avatarUrl"
                class="post-author-avatar"
                alt="Author Avatar"
              />
              <bold>{{ post.author }}</bold>
            </p>
          </div>
          <button class="post-button" @click="openLink(post.url)">
            <i :class="post.button ? post.button.icon : 'fa-solid fa-book'"></i
            ><span class="post-btn-text">{{
              post.button ? post.button.text : 'Read more'
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron';
import axios from 'axios';

import { cache } from '../../main';
import Logger from '../../javascript/logger';
import constants from '../../constants';

const logger = new Logger('home');

export default {
  name: 'Home',

  data: () => ({
    posts: [
      {
        imageUrl:
          'https://i.ibb.co/2g8VFGq/Discord-IAP-Key-Visuals-Header-02.jpg',
        description:
          'Hey guys! Our server got deleted so we created a new one! Learn more about the new features, and the new ecosystem we created!',
        author: 'Cy0ze',
        avatarUrl: 'https://cravatar.eu/avatar/Cy0ze',
        url: 'https://discord.gg/SolarTweaks',
        button: {
          text: 'Join server',
          icon: 'fa-brands fa-discord',
        },
      },
      {
        imageUrl:
          'https://launcherimages.lunarclientcdn.com/blogs/vday2022.f46a89d7b7.webp',
        description:
          'Happy Valentines Day! Take advantage of our new limited-edition Valentines 2022 cosmetics that are currently 15% off.',
        author: 'Physci',
        avatarUrl: 'https://cravatar.eu/avatar/Physci',
        url: 'https://store.lunarclient.com/',
      },
      {
        imageUrl:
          'https://launcherimages.lunarclientcdn.com/blogs/hypixelpartner.c0b01ee98c.webp',
        description:
          'Lunar Client has been added to the Hypixel Creator Program. You can now use code “LUNAR” when checking out on the Hypixel Network Store!',
        author: 'Physci',
        avatarUrl: 'https://cravatar.eu/avatar/Physci',
        url: 'https://www.lunarclient.com/news/lunar-client-x-hypixel-network/?utm_source=launcher&utm_medium=blog-post&utm_campaign=lead',
      },
    ],
  }),

  methods: {
    /**
     * Opens a link in the default browser
     * @param {string} url The url to open
     */
    openLink(url) {
      remote.shell.openExternal(url);
    },
  },

  beforeMount() {
    if (cache.has('blogPosts')) return (this.posts = cache.get('blogPosts'));

    axios
      .get(`${constants.API_URL}/launcher/blogPosts`)
      .then((response) => {
        this.posts = response.data;
        cache.set('blogPosts', this.posts);
      })
      .catch(() => {
        logger.warn(
          'Failed to fetch blog posts, falling back to hardcoded data...'
        );
        cache.set('blogPosts', this.posts);
      });
  },
};
</script>

<style scoped>
#posts-title {
  font-size: 1.25em;
  letter-spacing: 3px;
  line-height: 1.2;
  text-align: center;
  margin-top: 10px;
}

#posts-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.post-container {
  background-color: #201f1d;
  width: 400px;
  height: 260px;
  border-radius: 5px;
  margin-left: 6px;
  margin-right: 6px;
  transition: transform 0.4s ease;
}

.post-image-container {
  width: 400px;
  height: 170px;
  overflow: hidden;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.post-image {
  object-fit: cover;
  transition: transform 0.4s ease;
}

.post-container:hover .post-image {
  transform: scale(1.1);
}

.post-description {
  font-size: small;
  font-weight: 300;
  letter-spacing: 0.2px;
  line-height: 1.5;
  margin-left: 5px;
  margin-right: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-top: 4px;
}

#post-bottom-container {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.post-author-container {
  display: flex;
}

.post-author-container {
  margin-left: 5px;
  margin-right: 5px;
  margin-top: 15px;
}

.post-author-avatar {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  margin-left: 3px;
  margin-bottom: 2px;
  vertical-align: text-bottom;
}

.post-author {
  font-size: 14px;
}

.post-button {
  background-color: #2b71ce;
  border: none;
  width: 100px;
  height: 25px;
  border-radius: 2px;
  margin-top: 12px;
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.post-button:hover {
  background-color: #1c5cb6;
}

.post-btn-text {
  margin-left: 3px;
}
</style>
