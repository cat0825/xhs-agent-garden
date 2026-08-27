require("dotenv").config();
const slugify = require("@sindresorhus/slugify");
const settings = require("../../helpers/constants");

const allSettings = settings.ALL_NOTE_SETTINGS;

module.exports = {
  eleventyComputed: {
    layout: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "layouts/index.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "/";
      }
      if (data.permalink) {
        return data.permalink;
      }
      // Slugify the file path stem to generate clean URLs
      const stem = data.page.filePathStem.replace('/notes/', ''); // e.g. inbox/Post by @karpathy on X
      return `/notes/${slugify(stem)}/`;
    },
    basesNotes: (data) => {
      if (!data.collections || !data.collections.note) return [];
      return data.collections.note.map((item) => ({
        path: item.filePathStem.replace("/notes/", ""),
        url: item.url,
        metadata: item.data,
        fileSlug: item.fileSlug,
      }));
    },
    settings: (data) => {
      const noteSettings = {};
      allSettings.forEach((setting) => {
        let noteSetting = data[setting];
        let globalSetting = process.env[setting];

        let settingValue =
          noteSetting || (globalSetting === "true" && noteSetting !== false);
        noteSettings[setting] = settingValue;
      });
      return noteSettings;
    },
  },
};
