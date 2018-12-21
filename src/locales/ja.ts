// tslint:disable:max-line-length
export default {
  howToUse: '使い方',
  close: '閉じる',
  debugStart: '現在のプログラムで再ステップ実行',
  debugStop: '実行終了',
  debugBackAll: '実行中のプログラムを最初のステップに戻す',
  debugStepBack: '実行中のプログラムを1ステップ戻す',
  debugStep: 'プログラムを1ステップ実行する',
  debugStepAll: 'プログラムを最後まで実行する',
  changeThemedark: 'ダークテーマに切り替える',
  changeThemelight: 'ライトテーマに切り替える',
  zoomOut: 'エディタのフォントサイズを小さくする',
  zoomIn: 'エディタのフォントサイズを大きくする',
  zoomReset: 'エディタのフォントサイズをリセットする',
  howToText: [
    '下のエディタにプログラムを書き、上のボタンを押すことで可視化実行ができます。',
    '(マウスカーソルを重ねるとで各ボタンの説明が表示されます。)'
  ],
  uploadFile: 'アップロードされたファイルはここに表示されます。',
  warning: '警告!',
  editInDebug: `実行中のソースコードが編集されました。
プログラムの挙動には反映されませんが、
コードのハイライトが等がずれる恐れがあります。`,
  continueDebug: '続行',
  restart: '再実行',
  rememberCommand: 'この選択を記憶する',
  sourceCodeCcpp: String.raw`#include<stdio.h>
int recursiveToThree(int n){
  printf("%d th\n", n + 1);
  if(n < 3){
    int r = recursiveToThree(n + 1);
    n = r;
  }
  return n;
}
int main(){
  int n = 0;//変数定義

  n = recursiveToThree(0);//再帰関数呼出

  int arr[5] = {1, 2, 3};//配列変数

  int* ptr = &arr[2];//ポインタ変数
  *ptr = 5;

  //動的メモリ確保
  int* d_arry = malloc(sizeof(int) * 3);

  //二次元ポインタ配列の動的メモリ配列
  int* pd_arr[2];
  pd_arr[0] = malloc(sizeof(int) * 2);
  pd_arr[1] = malloc(sizeof(int) * 2);

  printf("Hello,world!\n");//標準出力

  //メモリの解放
  free(pd_arr[0]);
  return 0;
}`,
  sourceCodeJava: String.raw`public class Main {
  public static void main(String[] args) {
    System.out.println("3+2は" + (3 + 2) + "です。");
  }
}`
};
