// tslint:disable:max-line-length
export default {
  howToUse: 'How to use',
  close: 'Close',
  debugStart: 'restart step execution',
  debugStop: 'stop execution',
  debugBackAll: 'go backward for all steps',
  debugStepBack: 'step backward',
  debugStep: 'step forward',
  debugStepAll: 'execute all step',
  changeThemedark: 'change to dark theme',
  changeThemelight: 'change to light theme',
  zoomOut: 'change the font size to smaller.',
  zoomIn: 'change the font size to larger.',
  zoomReset: 'reset the font size',
  howToText: [
    'PVC.js has five GUI components:',
    '(1) editor, (2) execution controller, buttons, (3) I/O window, (4) canvas for visualization, and (5) file upload form.',
    'Users can write source code in the editor. Clicking on the execution control buttons initiates the step execution.',
    'The I/O window shows the content of the standard output written by the program (e.g., printf) and accepts standard input (e.g., scanf).',
    "Canvas shows the program's execution status using tables and figures.",
    'PVC.js adaptively changes its layout to correspond with the size of the browser window.'
  ],
  uploadFile: 'The uploaded file will be displayed here.',
  warning: 'Warning!',
  editInDebug: `The source code being executed has been edited.
Program behavior is not affected by changing code. 
However, the highlight of the code may be out of place.`,
  continueDebug: 'Continue',
  restart: 'Restart',
  rememberCommand: 'Remember this choice',
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
  int n = 0;//variable declaration

  n = recursiveToThree(0);//recursive function

  int arr[5] = {1, 2, 3};//array variable

  int* ptr = &arr[2];//pointer variable
  *ptr = 5;

  //dynamic memory allocation
  int* d_arry = malloc(sizeof(int) * 3);

  //two-dimensional dynamic array
  int* pd_arr[2];
  pd_arr[0] = malloc(sizeof(int) * 2);
  pd_arr[1] = malloc(sizeof(int) * 2);

  printf("Hello,world!\n");//standard output

  free(pd_arr[0]);//memory leak

  //File Output
  {
    FILE* fp=NULL;
    fp = fopen("PLIVET.txt", "w");
    fputs("PLIVET", fp);
    fclose(fp);
  }

  //File Input
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
`
};
