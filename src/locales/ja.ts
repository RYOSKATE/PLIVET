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
    '(マウスカーソルを重ねるとで各ボタンの説明が表示されます。)',
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

  free(pd_arr[0]);//メモリの解放

  printf("Hello,world!\n");//標準出力

  //ファイル出力
  {
    FILE* fp=NULL;
    fp = fopen("PLIVET.txt", "w");
    fputs("PLIVET", fp);
    fclose(fp);
  }

  //ファイル入力
  {
    FILE* fp=NULL;
    char buf[7];
    fp = fopen("PLIVET.txt", "r");
    while(fgets(buf,10,fp) != NULL) {
      printf("%s",buf);
    }
    fclose(fp);
  }

  return 0;
}`,
  sourceCodeJava: String.raw`import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    while (true) {
      int n = sc.nextInt();
      int r = sc.nextInt();
      if (n == 0) {
        break;
      }
      int[] a = new int[n];
      int[] b = new int[n];
      for (int i = 0; i < n; i++) {
        a[i] = n - i;
      }
      for (int i = 0; i < r; i++) {
        int p = sc.nextInt();
        int c = sc.nextInt();
        p--;
        for (int j = 0; j < c; j++) {
          b[j] = a[p + j];
        }
        for (int j = 0; j < p; j++) {
          b[c + j] = a[j];
        }
        for (int j = 0; j < p + c; j++) {
          a[j] = b[j];
        }
      }
      System.out.println(a[0]);
    }
  }
}`,
  sourceCodePython: String.raw`while True:
  n, r = map(int, input().split())
  if n == 0:
    break
  a = [0] * n
  b = [0] * n
  for i in range(n):
    a[i] = b[i] = n - i
  for i in range(r):
    p, c = map(int, input().split())
    p = p - 1
    for j in range(c):
      b[j] = a[p + j]
    for j in range(p):
      b[c + j] = a[j]
    for j in range(p + c):
      a[j] = b[j]
  print(a[0])
`,
};
