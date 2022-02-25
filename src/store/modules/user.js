import * as UserService from '@/api/usercenter/user'
import * as AuthService from '@/api/usercenter/auth'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { JSEncrypt } from 'jsencrypt'
import userDefaultAvatar from '@/assets/images/layout/user_avatar.gif'

const getDefaultState = () => {
  return {
    token: getToken(),
    number: '',
    name: '',
    avatar: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NUMBER: (state, number) => {
    state.number = number
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { loginName, password } = userInfo
    return new Promise((resolve, reject) => {
      // 获取加密公钥
      AuthService.encryptionFactor({ loginName: loginName.trim() })
        .then((response) => {
          const { result } = response
          const rsaPublicKey = result['publicKey']
          const jse = new JSEncrypt()
          jse.setPublicKey(rsaPublicKey)
          return UserService.login({ loginName: loginName.trim(), password: jse.encrypt(password) })
        })
        .then((response) => {
          const { result } = response
          commit('SET_TOKEN', result.accessToken)
          setToken(result.accessToken)
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  queryInfo({ commit }) {
    return new Promise((resolve, reject) => {
      UserService.queryInfo()
        .then((response) => {
          if (!response) {
            reject('身份认证失败或过期，请重新登录')
            return
          }

          const { result } = response
          commit('SET_NUMBER', result.userNo)
          commit('SET_NAME', result.userName)
          commit('SET_AVATAR', userDefaultAvatar)
          commit('SET_ROLES', result.roles)
          resolve(result)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      UserService.logout(state.token)
        .then(() => {
          removeToken() // must remove  token  first
          commit('RESET_STATE')
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken() // must remove token first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
