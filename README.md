# Headless Chrome on Cloud9 ハンズオン

[AWS Cloud9](https://aws.amazon.com/cloud9/) 上で [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) を使ってみるハンズオンです。

**Cloud9** は、ブラウザーのみでコードを記述、実行、デバッグできるクラウドベースの統合開発環境 (IDE) です。
クラウド上の Linux インスタンスをブラウザーから覗くというスタイルなので、ローカルマシンへのインストールは一切不要です。

**Headless Chrome** は、GUI を必要としない Chrome ブラウザーです。
GUI のない（まさに Cloud9 インスタンスのような）Linux 上でも簡単に実行でき、ブラウザー操作を自動化するのに役立ちます。

対象読者は以下のとおりです：

- Headless Chrome を使ったことがない人
- Cloud9 を使ったことがない人
- どちらも使ったことはあるが、組み合わせて使ったことはない人

[Angular](https://angular.io/) や [React](https://reactjs.org/) といったフレームワークは使わないので HTML, JavaScript が少しでも書けるなら大丈夫です。


## Cloud9 セットアップ

### Why Cloud9?

他のクラウド IDE には、たとえば [Codeanywhere](https://codeanywhere.com/) があります。
クラウド IDE の中から Cloud9 を選択したのは、Codeanywhere が劣っているからではなく、既に持っていた AWS アカウントによって Cloud9 を簡単に利用できたからです。
必要なのは AWS EC2 の利用料のみで、EC2 の知識があれば VPC 内の他のサーバーと連携することも可能という柔軟性を持ち、とにかくハードルが低いのがよいですね。

### Create environment

AWS console にログインし Cloud9 のページを開きます。
Cloud9 は東京リージョンでは使えないので、`Asia Pacific (Singapore)` を選択します。

Cloud9 のページで `Create environment` を選択します。
Name は、ファイル名をつける感覚で、好きなものを設定すればよいです。
Environment settings は、デフォルト (`EC2`, `t2.micro`, `After 30 minutes`) のまま、`Create environment` を選択します。

数分待てばインスタンスが起動し、セットアップは完了です。
簡単！

---
ここからは、Cloud9 上での操作です。
しばらくターミナルを使った CLI 操作が続きます。


## Git セットアップ

Git はあらかじめインストールされていますが、初期状態ではコミットすらままならないので、最低限のセットアップをしておきます。

### `user.name`, `user.email`, `core.editor` の変更

まず、自分の名前とメールアドレスを設定します：

```bash
git config --global user.name <your name>
git config --global user.email <your email>
```

次に、コミットコメントを書くエディターです。
Amazon Linux では nano がデフォルト設定（しかも .bashrc に書かれている！）のようなので、Vim しか使えない私は変更しておきます。
`vim ~/.bashrc` で .bashrc を開き、23 行目あたりを編集します：

```diff
  # Set default editor for git
- git config --global core.editor /usr/bin/nano
+ git config --global core.editor /usr/bin/vim
```

編集後は `. ~/.bashrc` によって、現在のターミナルにも設定を適用しておきます。


## Web アプリケーションの作成

サンプルは [kazuma1989/headless-chrome-cloud9-handson: Try Headless Chrome (with Puppeteer) on AWS Cloud9 (EC2 Amazon Linux).](https://github.com/kazuma1989/headless-chrome-cloud9-handson) にあります。

### Node.js プロジェクトの初期化

サーバーを起動したり、Headless Chrome を操作したりするため、[Node.js](https://nodejs.org/en/) を使います。
まず、Cloud9 にデフォルトでインストールされている Node.js のバージョン (v6.12.3) をアップグレードします：

```bash
nvm install 8.9.4
nvm alias default v8.9.4
```

次に、自分のプロジェクトフォルダーを作成し、Node.js プロジェクトとして初期化します：

```bash
cd ~/environment/
mkdir myapp
cd myapp
npm init -y
```

`package.json` が生成されたら成功です：

```diff
+ myapp/
+ └── package.json
```

### index.html 作成

index.html を追加します。
Headless Chrome の動作を確認するため、最低限のスタイルとスクリプトを追加しています：

```diff
  myapp/
+ ├── index.html
  └── package.json
```

```html
<!DOCTYPE html>
<meta charset="UTF-8">
<title>My App</title>
<style>
    main {
        color: red;
    }
</style>

<main></main>
<script>
    document.querySelector('main').textContent = new Date();
</script>
```

### serve インストール

index.html を見る web サーバーとして `serve` をインストールします：

```bash
npm install --save-dev serve
```

```diff
  myapp/
  ├── index.html
+ ├── node_modules
  ├── package.json
+ └── package-lock.json
```

package.json には `serve` スクリプトを追加し、`npm run serve` によってサーバーが起動するようにしておきます：

```diff
   "scripts": {
+    "serve": "serve ./",
     "test": "echo \"Error: no test specified\" && exit 1"
   },
```

`npm run serve` によってサーバーを起動したら、Cloud9 メニュー > Preview > Preview Running Application を選択して、アプリケーションを表示します。
以下のような画面が表示されれば成功です：

![App preview](images/01_serve-install-result.png)


## Headless Chrome によるテスト作成

### Why Headless Chrome? Puppeteer?

他のヘッドレスブラウザーには、たとえば [PhantomJS](http://phantomjs.org/) や [Nightmare](http://www.nightmarejs.org/) があります。
これらは独自のエンジンや [Electron](https://electronjs.org/) ベースのエンジン、すなわち Chrome とは異なったエンジンで動作するのに対し、Headless Chrome は Chrome 本体の起動モードの一つです。
とくに理由がなければ、ユーザーが使う「本物」でテストできるほうが好ましいでしょう。

[Puppeteer](https://github.com/GoogleChrome/puppeteer) は、Headless Chrome の Node.js API です。
同様のライブラリーにたとえば [Chromeless](https://github.com/graphcool/chromeless) がありますが、Puppeteer は Chrome 開発チーム製である点で、一線を画しています。

### Puppeteer インストール

Puppeteer にはデフォルトで Chrome が同梱されるので、インストールはこれだけです：

```bash
npm install --save-dev puppeteer
```

### smoke.test.js 作成

アプリケーションが煙をあげていないかチェックする、最低限のテストを追加します。
とは言っても、スクリーンショットを 1 枚撮るだけですが：

```diff
  myapp/
  ├── index.html
  ├── node_modules
  ├── package.json
  ├── package-lock.json
+ └── smoke.test.js
```

```js
const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:8080/');
    await page.screenshot({ path: 'example.png' });

    await page.close();
    await browser.close();
})();
```

package.json に test スクリプトの定義を追加しておきます：

```diff
   "scripts": {
     "serve": "serve ./",
-    "test": "echo \"Error: no test specified\" && exit 1"
+    "test": "node ./smoke.test.js"
   },
```

`npm run serve` でアプリケーションを起動し、`npm run test` でテストが実行されます。


## Troubleshooting Puppeteer on Cloud9

### Run Headless Chrome on EC2 Amazon Linux

### Install a Japanese font


## アプリケーション拡張 - ajax 機能の追加

### script.js 作成

### JSON Server インストール

### JSON API のモックテスト


# Optional trainings

## Install Jest

## Install Webpack

## Install SPA frameworks
