<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      class="login-form"
      auto-complete="on"
      label-position="left"
      inline-message
      :model="loginForm"
      :rules="loginRules"
    >
      <div class="title-container">
        <h3 class="title">QA Cloud</h3>
      </div>

      <el-form-item prop="loginName">
        <span class="svg-container"><SvgIcon icon-name="login-user" /></span>
        <el-input
          ref="loginName"
          v-model="loginForm.loginName"
          placeholder="账号"
          name="loginName"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container"><SvgIcon icon-name="login-password" /></span>
        <el-input
          ref="password"
          :key="passwordType"
          v-model="loginForm.password"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          :type="passwordType"
          @keyup.enter="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <SvgIcon :icon-name="passwordType === 'password' ? 'login-eye' : 'login-eye-open'" />
        </span>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        size="large"
        style="width: 100%; margin-bottom: 30px"
        @click.prevent="handleLogin"
      >
        登 录
      </el-button>
    </el-form>
  </div>
</template>

<script>
import { isEmpty } from 'lodash-es'
export default defineComponent({
  name: 'Login',
  data() {
    const validateLoginName = (_, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('登录账号不能为空'))
      } else {
        callback()
      }
    }
    const validatePassword = (_, value, callback) => {
      if (isEmpty(value)) {
        callback(new Error('登录密码不能为空'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        loginName: '',
        password: ''
      },
      loginRules: {
        loginName: [{ required: true, trigger: 'blur', validator: validateLoginName }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    async handleLogin() {
      // 表单校验
      const error = await this.$refs.loginForm
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 登录
      try {
        this.loading = true
        await this.$store.dispatch('user/login', this.loginForm)
        this.$router.push({ path: this.redirect || '/' }, () => {})
        this.loading = false
      } catch (error) {
        this.loading = false
        console.error(error.toString())
      }
    }
  }
})
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>

<style lang="scss">
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

.login-container {
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
  .el-input {
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  .el-input__inner {
    box-shadow: none !important;
  }
  .el-input__wrapper {
    background-color: inherit;
    box-shadow: none;
  }
}
</style>
