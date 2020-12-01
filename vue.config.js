module.exports = {
  lintOnSave: true,
  runtimeCompiler: true,
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "@/scss/main.scss";`
      }
    }
  }
}