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

コードを書くまえに [Git セットアップ (optional)](docs/git-setup.md) をおすすめします。


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
Headless Chrome の動作を確認しやすくするため、最低限のスタイルとスクリプトを追加しています：

```diff
  myapp/
+ ├── index.html
  └── package.json
```

<details>
<summary>index.html</summary>

```html
<!DOCTYPE html>
<meta charset="UTF-8">
<title>My App</title>
<style>
    html {
        background: gainsboro;
        border: solid 1px black;
        box-sizing: border-box;
        color: red;
        height: 100%;
    }
</style>

<main></main>
<script>
    const date = new Date().toLocaleString('ja-JP-u-ca-japanese', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
    });

    document.querySelector('main').textContent = date;
</script>
```

</details>

### http-server インストール

index.html を見る web サーバーとして `http-server` をインストールします：

```bash
npm install --save-dev http-server
```

```diff
  myapp/
  ├── index.html
+ ├── node_modules
  ├── package.json
+ └── package-lock.json
```

package.json には `start` スクリプトを追加し、`npm run start` によってサーバーが起動するようにしておきます：

```diff
   "scripts": {
+    "start": "http-server ./",
     "test": "echo \"Error: no test specified\" && exit 1"
   },
```

`npm run start` によってサーバーを起動したら、Cloud9 メニュー > Preview > Preview Running Application を選択して、アプリケーションを表示します。
以下のような画面が表示されれば成功です：

![App preview](images/app-preview.png)

🎉


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
とは言っても、スクリーンショットを 1 枚撮るだけです：

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
    await page.screenshot({ path: 'screenshot.png' });

    await page.close();
    await browser.close();
})();
```

package.json に test スクリプトの定義を追加しておきます：

```diff
   "scripts": {
     "start": "http-server ./",
-    "test": "echo \"Error: no test specified\" && exit 1"
+    "test": "node ./smoke.test.js"
   },
```

`npm run start` でアプリケーションを起動し、別のターミナルから `npm run test` を実行することでテストができます…：

```bash
(node:8637) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: Failed to launch chrome!
/home/ec2-user/environment/myapp/node_modules/puppeteer/.local-chromium/linux-536395/chrome-linux/chrome: error while loading shared libraries: libXcursor.so.1: cannot open shared object file: No such file or directory


TROUBLESHOOTING: https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md

(node:8637) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

おや、エラーになってしまいました。
解決しましょう。


## Troubleshooting Puppeteer on Cloud9

### Run Headless Chrome on EC2 Amazon Linux

エラーの内容や、[TROUBLESHOOTING](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md) のリンク先を見ると、どうやら依存パッケージが不足しているようです。
この問題は、`shared libraries: libXcursor.so.1` というメッセージやリンク先の手順を手がかりにパッケージをインストールしても、素直には解決しませんでした。

しばらく検索したあと、次ような投稿を見つけ、解決することができました。
最高、ありがとう！：

- [MockingBot - Run Puppeteer/Chrome Headless on EC2 Amazon Linux](https://mockingbot.com/posts/run-puppeteer-chrome-headless-on-ec2-amazon-linux)

ここに書かれている、必要なコマンドは、次のスクリプトにまとめたので、これを実行するだけで OK です：  
[install-chrome-dependencies.sh](install-chrome-dependencies.sh)

```bash
sh install-chrome-dependencies.sh
```

`npm run start` の後に `npm run test` で、今度こそテストが実行され、スクリーンショットが生成されます：

```diff
  myapp/
  ├── index.html
  ├── node_modules
  ├── package.json
  ├── package-lock.json
+ ├── screenshot.png
  └── smoke.test.js
```

![Generated screenshot](images/screenshot-tofu.png)

🎉🎉

### Install a Japanese font

Headless Chrome によってスクリーンショットを撮ることはできましたが、日本語が tofu になっています。
これは Chrome の問題ではなく、Cloud9 のインスタンスに日本語フォントがインストールされていないためです。

以下の方法で [VLゴシック](http://vlgothic.dicey.org/) をインストールして解決します：

```bash
sudo yum install -y vlgothic-fonts
```

![Generated screenshot without tofu](images/screenshot-notofu.png)

🎉🎉🎉

## アプリケーション拡張

ここまでで、Cloud9 上で Headless Chrome を使えるようになり、開発のベースは整いました。
あとは自分のアプリケーション開発に生かしてもらえれば良いですが、参考までにアプリケーションを拡張してみます。


### 検索機能の追加

index.html を次のように修正します：

```diff
-<main></main>
+<main>
+    <input id="name">
+    <button id="search">Search</button>
+    <pre id="result"></pre>
+</main>
 <script>
-    const date = new Date().toLocaleString('ja-JP-u-ca-japanese', {
-        year: 'numeric',
-        month: 'short',
-        day: 'numeric',
-        weekday: 'short',
-    });
+    const input = document.querySelector('#name');
+    const button = document.querySelector('#search');
+    const result = document.querySelector('#result');
+
+    button.addEventListener('click', async event => {
+        const name = input.value;
+        const response = await fetch(`/users?name_like=${name}`, {
+            credentials: 'same-origin'
+        });

-    document.querySelector('main').textContent = date;
+        result.textContent = await response.text();
+    });
 </script>
```

次の図のように、ボタンを押すとユーザーを検索する機能を追加しました：

![Modified app preview](images/modified-app-preview.png)

しかし実際には、HTML を修正しただけでは検索の API `/users` が存在しないため、404 エラーにしかなりません。
[JSON Server](https://github.com/typicode/json-server) をインストールし、API として機能させます：

```bash
npm install --save-dev json-server
```

中身のデータは `stub.json` として用意し：

```diff
  myapp/
  ├── index.html
  ├── node_modules
  ├── package.json
  ├── package-lock.json
  ├── screenshot.png
  ├── smoke.test.js
+ └── stub.json
```

<details>
<summary>stub.json</summary>

```json
{
    "users": [{
        "id": 1,
        "name": "John Doe"
    }, {
        "id": 2,
        "name": "Jane Doe"
    }]
}
```

</details>

`package.json` には、http-server からのプロキシー設定と `stub` スクリプトを追加しておきます：

```diff
   "scripts": {
-    "start": "http-server ./",
+    "start": "http-server ./ --proxy http://localhost:3000",
+    "stub": "json-server --watch ./stub.json",
     "test": "node ./smoke.test.js"
   },
```

`npm run start` と `npm run stub` は別のターミナルから実行する必要がありますが、起動させれば検索機能がちゃんと動いているのが見られます。

### JSON API のモックテスト

アプリケーションの拡張に合わせて、`smoke.test.js` も拡張してみます：

```diff
+const { URL } = require('url');
 const puppeteer = require('puppeteer');

 (async() => {
     const browser = await puppeteer.launch();
     const page = await browser.newPage();

+    await page.setRequestInterception(true);
+    page.on('request', request => {
+        const { pathname } = new URL(request.url());
+        if (pathname === '/users') {
+            const mockedData = [{
+                id: 3,
+                name: 'Jackson Doe'
+            }];
+            request.respond({
+                contentType: 'application/json',
+                body: JSON.stringify(mockedData)
+            });
+        }
+        else {
+            request.continue();
+        }
+    });
+
     await page.goto('http://localhost:8080/');
+
+    await page.click('#name');
+    await page.keyboard.type('doe');
+    await page.click('#search');
+
     await page.screenshot({ path: 'screenshot.png' });

     await page.close();
```

`/users` へのリクエストをインターセプトして、`stub.json` には存在しないデータを返すようにしています。
`npm run test` の結果はこの通りです：

![Mocked results](images/mocked-results.png)

🎉🎉🎉🎉


# Optional trainings

<details>
<summary>No content yet</summary>

## Install Jest

## Install Webpack

## Install SPA frameworks
    
</details>



# 参考文献

- [MockingBot - Run Puppeteer/Chrome Headless on EC2 Amazon Linux](https://mockingbot.com/posts/run-puppeteer-chrome-headless-on-ec2-amazon-linux)
- [CentOSでもWindowsでも使える！ 日本語フォント（ゴシック編） | 株式会社ビヨンド](http://beyondjapan.com/blog/2017/01/japanese-gothic-fonts-on-linux)
