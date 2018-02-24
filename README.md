# Headless Chrome on Cloud9 ハンズオン

[AWS Cloud9](https://aws.amazon.com/cloud9/) 上で [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) を使ってみるハンズオンです。

**Cloud9** は、ブラウザーのみでコードを記述、実行、デバッグできるクラウドベースの統合開発環境 (IDE) です。
クラウド上の Linux インスタンスをブラウザから覗くというスタイルなので、ローカルマシンへのインストールは一切不要です。

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
必要なのは AWS EC2 の利用料のみで、EC2 の知識があれば VPC 内の他のサーバーと連携することも可能で、とにかくハードルが低いのがよいですね。

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

```diff:~/.bashrc
  # Set default editor for git
- git config --global core.editor /usr/bin/nano
+ git config --global core.editor /usr/bin/vim
```

編集後は `. ~/.bashrc` によって、現在のターミナルにも設定を適用しておきます。

### Tig インストール (optional)

Git をグラフィカルに利用したい場合は、Tig をインストールしておきます。

```bash
sudo yum install -y tig
```


## サンプルプロジェクトのクローン

https://github.com/kazuma1989/headless-chrome-cloud9-handson.git


## Node v8 インストール

### Yarn インストール (optional)


## Web アプリケーションの作成

### index.html 作成

### serve インストール


## Headless Chrome によるテスト作成

### Puppeteer インストール

### smoke.test.js 作成


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
