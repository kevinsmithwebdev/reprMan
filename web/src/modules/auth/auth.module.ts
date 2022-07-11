class AuthModule {
  static _instance = new AuthModule()

  isAuthenticated = false

  constructor() {
    console.log('asdf constructor')
    if (!AuthModule._instance) {
      AuthModule._instance = this
    }
  }

  signIn(callback: VoidFunction) {
  this.isAuthenticated = true
    setTimeout(callback, 500)
  }

  signOut(callback: VoidFunction) {
    this.isAuthenticated = false
    setTimeout(callback,500)
  }
}

export default AuthModule._instance
