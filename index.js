const wrapper = (fn, arg) => {
  return new Promise((resolve, reject) => {
    fn(arg).then((response) => {
      if (response.body.ok) {
        resolve(response.body)
      } else {
        reject(response.body)
      }
    })
  })
}

const getUser = require('./getUser.js')
const postUser = require('./postUser.js')
const postUserLogin = require('./postUserLogin.js')
const getUserChoirs = require('./getUserChoirs.js')
const getChoir = require('./getChoir.js')
const getChoirMembers = require('./getChoirMembers.js')
const getChoirSong = require('./getChoirSong.js')
const getChoirSongs = require('./getChoirSongs.js')
const postChoir = require('./postChoir.js')
const postChoirJoin = require('./postChoirJoin.js')
const postChoirSong = require('./postChoirSong.js')
const postChoirSongPartName = require('./postChoirSongPartName.js')
const deleteChoirSongPartName = require('./deleteChoirSongPartName.js')
const postChoirSongPart = require('./postChoirSongPart.js')
const getChoirSongPart = require('./getChoirSongPart.js')
const getChoirSongParts = require('./getChoirSongParts.js')
const postInvitation = require('./postInvitation.js')
const getInvitation = require('./getInvitation.js')
const getInvitationList = require('./getInvitationList.js')
const deleteInvitation = require('./deleteInvitation.js')
const postRender = require('./postRender.js')
const getRender = require('./getRender.js')

module.exports = {
  getUser: arg => wrapper(getUser, arg),
  postUser: arg => wrapper(postUser, arg),
  postUserLogin: arg => wrapper(postUserLogin, arg),
  getUserChoirs: arg => wrapper(getUserChoirs, arg),
  getChoir: arg => wrapper(getChoir, arg),
  getChoirMembers: arg => wrapper(getChoirMembers, arg),
  getChoirSong: arg => wrapper(getChoirSong, arg),
  getChoirSongs: arg => wrapper(getChoirSongs, arg),
  postChoir: arg => wrapper(postChoir, arg),
  postChoirJoin: arg => wrapper(postChoirJoin, arg),
  postChoirSong: arg => wrapper(postChoirSong, arg),
  postChoirSongPartName: arg => wrapper(postChoirSongPartName, arg),
  deleteChoirSongPartName: arg => wrapper(deleteChoirSongPartName, arg),
  postChoirSongPart: arg => wrapper(postChoirSongPart, arg),
  getChoirSongPart: arg => wrapper(getChoirSongPart, arg),
  getChoirSongParts: arg => wrapper(getChoirSongParts, arg),
  postInvitation: arg => wrapper(postInvitation, arg),
  getInvitation: arg => wrapper(getInvitation, arg),
  getInvitationList: arg => wrapper(getInvitationList, arg),
  deleteInvitation: arg => wrapper(deleteInvitation, arg),
  postRender: arg => wrapper(postRender, arg),
  getRender: arg => wrapper(getRender, arg)
}
