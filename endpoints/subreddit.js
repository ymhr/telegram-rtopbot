'use strict';
const Promise = require('bluebird');
const md5 = require('md5');

const superagent = require('superagent');
const endPoint = 'http://www.reddit.com/r/';

exports.getTopPics = function(subreddit){
    const url = generateUrl(subreddit);

    return new Promise((resolve, reject) => {
        superagent.get(url)
            .end((err, res) => {

                if(
                    err ||
                    res.status === 404 ||
                    !res.body.data ||
                    !res.body.data.children
                ){
                    reject('No pictures or subreddit does not exist');
                    return;
                }

                const response = generateResponse(res.body);

                console.log(response);

                resolve(response);
            });
    });

}

const generateUrl = (subreddit) => {
    return endPoint + subreddit + '.json'
}

const generateResponse = (posts) => {
    let images = getImages(posts.data.children);

    return images
        .filter(image => image.photo_url !== null)
        .map(image => {
            return {
                type: 'photo',
                id: md5(image.photo_url),
                title: image.title,
                caption:image.title,
                photo_url: image.photo_url,
                thumb_url: image.thumb_url,
                photo_width: image.photo_width,
                photo_height: image.photo_height
            }
        });

}

const getImages = (posts) => {
    let images = [];
    posts.forEach(post => {
        let data = {};
        if(post.data.domain.indexOf('imgur.com') > -1){
            if(images.length < 50){
                let url = post.data.url;
                // data.photo_url = generateImageUrl(url)
                data.photo_url = getSourceImage(post.data);
                data.photo_width = getSourceImageWidth(post.data);
                data.photo_height = getSourceImageHeight(post.data);
                // data.thumb_url = generateThumbail(url);
                data.thumb_url = post.data.thumbnail;
                data.title = post.data.title + ' - via ' + post.data.subreddit;

                if(data.photo_url !== null){
                    images.push(data);
                }
            }
        }
    });

    return images;
}

const getSourceImage = (data) => {
    if(!data.preview) return null;
    let image = null;
    data.preview.images.forEach((images, index) => {
        image = images.source.url;
    });
    return image;
}

const getSourceImageWidth = (data) => {
    if(!data.preview) return null;
    let image = null;
    data.preview.images.forEach((images, index) => {
        image = images.source.height;
    });
    return image;
}

const getSourceImageHeight = (data) => {
    if(!data.preview) return null;
    let image = null;
    data.preview.images.forEach((images, index) => {
        image = images.source.width;
    });
    return image;
}
