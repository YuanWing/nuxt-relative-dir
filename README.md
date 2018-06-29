## 为什么需要
[Nuxt](https://nuxtjs.org/)为我们提供了基于[Vue](https://vuejs.org/)的服务端渲染，并且能使用 `nuxt generate` 生成静态页面;  

生成的静态页面都是使用的绝对路径来访问的资源，如果要进行 `Hybrid app` 开发或者使用 `Cordova` 打包成`APP`资源就访问不到了;

因此，才有这个插件;将 `Nuxt` 生成的静态页面内的资源文件路径替换成相对路径;

## 如何使用

- 安装:
  ```
  $ npm install nuxt-relative-dir OR yarn add nuxt-relative-dir
  ```
- 使用:  
  修改项目的 `package.json` 文件，添加 `scripts`
  ```
  {
    "scripts": {
      "build": "nuxt build && backpack build",
      "generate": "nuxt generate",
      "nrd": "nuxt-rd"
    }
  }
  ```
  执行 `nuxt-rd` 命令前，要先执行 `generate` 生成静态文件，默认 `generate` 会将生成的文件放到 `/dist` 目录内;  
  
  `nuxt-rd` 默认会从 `/dist` 目录内读取静态文件，然后会将 `nuxt generate` 生成的 `*.html` 文件，转换成相对路径后放到 `/hybrid/` 目录内，生成的 `*.css`、`*.js`、`*.(png|jpe?g|gif|svg)`等文件放到 `/hybrid/static/` 目录内;  

  当然，我们也可以自定义生成/读取的目录:
  ```
  $ nuxt-rd -d pages/resource -s assets
  ```
  这样，会从 `/assets` 目录读取文件，然后把转换后的 `*.html` 放到 `/pages/ `目录内，而其他资源会放到`resource`目录内;
