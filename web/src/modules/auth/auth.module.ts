class AuthModule {
  static instance: AuthModule

  // eslint-disable-next-line class-methods-use-this
  static getInstance() {
    if (!AuthModule.instance) {
      AuthModule.instance = new AuthModule()
    }
    return AuthModule.instance
  }
}

export default AuthModule
