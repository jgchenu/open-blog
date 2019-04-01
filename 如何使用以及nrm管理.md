无论是使用vue以及react，我们都需要配置开发环境以及使用命令行工具，下面来介绍下如何使用npm以及使用nrm管理源

### 1.首先打开nodejs官方中文网

```
https://nodejs.org/zh-cn/
```
选择LTS稳定版本，npm是随着nodejs一起安装的。

下载完双击默认安装就可以了。linux系统的可以参照官网，也是有直接安装的命令的。

### 2.查看node跟npm是否安装成功

win键+r 打开运行，输入 cmd 然后回车键，在dos命令行界面下输入
```
node -v
npm -v
```
如果都有显示版本号，那就安装成功了。

### 3。更改源的使用
由于npm的官方服务器是在国外的，所以如果没有科学上网的话，下载东西的速度是很慢的，而且可能出现下载失败的问题。
所以为了方便我们的开发，我们要手动切换一下到国内的镜像源。
这里是淘宝的镜像源，手动复制一下。
```
https://registry.npm.taobao.org
```
在dos命令行下粘贴下面的命令进行更改
```
npm config set registry https://registry.npm.taobao.org
```
修改了npm默认的安装源之后

通过输入
```
npm config get registry
```
检验是否配置成功，配置成功后，使用npm安装其实就是用淘宝的镜像源下载东西了也就是使用cnpm

### 4.使用cnpm安装

除此之外，我们还可以使用淘宝镜像提供的 cnpm 工具，通过 cnpm 来安装一般速度会更快一些，我们可以直接复制文档中的命令：
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```
粘贴在dos命令行中，回车进行安装，初次安装需要等待的时间可能会比较久，一定要有耐心。
等待安装完成之后，我们可以在命令行输入 cnpm -v 来测试是否安装成功。以后用npm安装 插件就可以改成cnpm安装了。

### 5.nrm管理以及切换源

nrm 是一个管理切换 npm registries 的命令行工具，由于各个地区不同的网络环境，以及镜像同步不全的问题，在使用淘宝源时仍有可能遇到一次错误，或者在使用脚手架工具的时候，会默认使用npm，但是大家也知道国内的环境是很慢的，我们就需要一个工具来切换源了，我们可以通过使用 nrm 可以迅速在各个安装源之间进行切换，而且它还带有测速功能，这能让我们很方便地挑选出最适合自己使用的安装源。
在dos命令行复制粘贴下列命令
```
npm install -g nrm
```
来安装 nrm 工具。安装好之后，你可以通过在dos命令行输入：
```
nrm ls
```
显示使用的源地址，带*的就是目前使用的。
```
* npm ----- https://registry.npmjs.org/
cnpm ---- http://r.cnpmjs.org/
taobao -- https://registry.npm.taobao.org/
nj ------ https://registry.nodejitsu.com/
rednpm -- http://registry.mirror.cqupt.edu.cn
skimdb -- https://skimdb.npmjs.com/registry
```
要想切换目前使用的源，
比如我想使用cnpm 的源，那么我就可以输入：
```
nrm use cnpm
```
那么在使用npm 下载包的使用，使用的就是cnpm的镜像源下载东西了。

想要了解到每个源的下载速度，那么就可以在dos命令行输入：
```
nrm test
```