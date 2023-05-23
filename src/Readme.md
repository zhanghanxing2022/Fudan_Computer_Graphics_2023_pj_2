## 项目目录及文件说明

src 项目代码

- config.js 项目实践代码
- PJ2.html 项目页面
- lib 项目依赖包

## 开发及运行环境

Google Chrome 111.0.5563.146（正式版本） (arm64)

## 运行及使用方法

使用浏览器打开src/PJ2.html

## 项目中的亮点

- 加入一个优先队列，总是最后绘制受影响的三角形。也就是如果移动的点只影响到某一个四边形，那么这个四边形将不会被其他四边形遮挡。如果移动的点影响多个四边形，那么影响到的四边形将不会被未被移动的四边形遮挡。

- 采用模块化编程，使用`RotatingScaleMutiTriangle`类封装动画设计的数据，防止创建过多全局变量类型；同时暴露几个明晰的接口用于绘制图形；将shader中定义的变量的获取工作放在构造函数一次中全部完成。

  ```js
  class RotatingScaleMutiTriangle
  {
     	constructor(gl)//构造函数
     	enableLine()//是否绘制线段
     	begin()//从暂停中恢复动画
     	reset()//重新开始动画
     	updatePoint(drawLine)//更新顶点位置
     	animate()//根据时间更新angle、zoom
     	draw()//绘制图形
  }
  ```

- 复用绑定三角形位置和颜色数据的函数`RotatingScaleMutiTriangle.updatePoint()`,根据bool变量drawLine决定是绑定三角形绘制数据还是线段绘制数据。

- 仿照polygon数组创立一个triangle数组，每个元素为构成一个三角形的三个顶点的编号，根据triangle生成绘制三角形的位置和颜色数据，保留了程序可拓展性，

## 开发过程中遇到的问题（以及你的解决办法）

- 动画暂停后恢复出现问题

  加入一个begin()函数和一个变量go，表示动画是否暂停。当恢复动画时，先调用rsmt.begin()更新g_last（表示上次浏览器调用tick()的时间），之后调用animate更新参数。当动画暂停时，不在调用animate更新角度和大小，使得图形保持静止。

- 当暂停动画播放时对顶点尝试拖拽，发现没有选中预期顶点。

  `WebGl`所绘制的点的实际位置由$u\_ModelMatrix$和$a\_Position$共同计算得出。所以在屏幕上显示的点的坐标并不是$a\_Position$。
  $$
  gl\_Position/*实际绘制坐标*/ = u\_ModelMatrix *a\_Position/*动画前初始坐标*/;
  $$
  鼠标在$gl\_Position$附近点击，要使得$chooseDragPoint$函数选中$a\_Position$所对应的点。就需要将等式两侧同$u\_ModelMatrix^{-1}$。
  $$
  mouse\_Position*u\_ModelMatrix^{-1}=a\_Position
  $$
  同时，因为`Canvas`坐标和`WebGL`坐标不同，需要将$mouse\_Position$坐标转化为以画布中心为原点，X轴向右，Y轴向上的坐标系下的坐标。但是可以不将$mouse\_Position$归一化。

- js函数值传递还是引用传递

  `chooseDragPoint`与`updateVertexPos`相较于PJ1，多了一个参数`modelMatrix`。因为我知道`modelMatrix.invert()`会修改变量本身，所以选择在以参数形式传递原矩阵，在函数内部对原矩阵进行转置。

  随之却出现了一些bug：点击时所选定点偶尔会闪现到原点附近。后来发现`chooseDragPoint`与`updateVertexPos`中`modelMatrix`是引用传递，点击后移动时，原矩阵在第奇数次调用`updateVertexPos`时被修改为逆阵，导致出现错误。

- Google Chrome无法打印即时数据

  展开对象时，其实是重新去内存中读取对象的属性值，此时对象属性已被更改，看到的值是“展开”那一刻时对象的值，而非`console`执行那时候的值。

  在需要用`console.log`调试时，尽量不要直接输出对象，先将对象序列化`JSON.stringify()`为字符串再输出。或者使用打断点`debugger`的方式来调试。

## 项目仍然或者可能存在的缺陷（以及你的思考）

- 使用优先队列保证受影响的三角形最后绘制。但是当有多个三角形收到影响时，相互之间的关系会出现可能会出现错误。
- 实例代码中animate每次都根据与上次调用的间隔来更新angel。经过调试，发现浏览器相邻两次调用tick()函数的时间间隔不同，为15-17ms不等，使得帧率保持在大多数电脑显示器的刷新频率60HZ左右。
