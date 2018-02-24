# Git セットアップ (optional)

Cloud9 には、Git があらかじめインストールされていますが、初期状態ではコミットすらままならないので、最低限のセットアップをしておきます。


## `user.name`, `user.email` の設定

まず、自分の名前とメールアドレスを設定します：

```bash
git config --global user.name <your name>
git config --global user.email <your email>
```


## `core.editor` の変更

次に、コミットコメントを書くエディターです。
Amazon Linux では nano がデフォルト設定（しかも .bashrc に書かれている！）のようなので、Vim しか使えない私は変更しておきます。
`vim ~/.bashrc` で .bashrc を開き、23 行目あたりを編集します：

```diff
  # Set default editor for git
- git config --global core.editor /usr/bin/nano
+ git config --global core.editor /usr/bin/vim
```

編集後は `. ~/.bashrc` によって、現在のターミナルにも変更を反映しておきます。
