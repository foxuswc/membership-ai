# MemberShip AI · V1.6

这是基于88VIP业务研究及Figma高保真概念设计开发的独立决策验证项目，不是淘宝官方系统。Figma仍是高保真设计稿，网页为可交互的消费流程及研发验证台。

## V1.6 · 双视图与高保真素材

顶部可切换消费者体验版与策略评测后台，共享同一会话与权益决策状态。消费者端隐藏策略配置，提供可操作的酒店房型和电影选座流程；后台展示当次决策、会话次数、权益库和评测计划，不伪造经营指标。酒店使用此前 Figma 中的 AI 生成客房图，影院为概念效果图中的摄影风格素材，均非真实房源、影院或库存照片。图片随仓库部署，无需外部图床。模拟业务与真实交易边界不变。

## V1.5 · 具体消费链路

新增消费者端酒店房型选择、电影场次与选座、闪购订单及退票详情。住宿与观影必须完成具体选择后，才能继续确认方案；更换房型、场次或座位后，调用原有 /api/recommend 重新核验并计价。保留原始方案与会员方案，非会员开卡费仅在总方案计算中计入。所有房型、影片、价格、座位及资格均为模拟；无真实下单、库存或支付。酒店与电影页面为自主风格设计，不是官方页面。

线上更新：Render 控制台进入 membership-ai Web Service，Manual Deploy → Deploy latest commit；当前 Blueprint 关闭自动部署，提交 GitHub 不等于上线。免费方案可能休眠。

## 在线部署（Render，免费演示）

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/foxuswc/membership-ai)

点击按钮，登录 Render 并确认创建一个 Free Web Service。配置已在 render.yaml 中定义：Singapore、Gunicorn、构建时运行测试、/health 健康检查。部署成功后，使用 Render 控制台实际分配的 HTTPS 网址访问。默认关闭自动部署（避免其他人通过公开仓库部署的副本被意外更新）；如需更新，可在 Render 手动部署最新 main 提交。

公开演示使用 cloud_app.py 的 WSGI 接口，强制规则基线，不调用模型、不读取真实会员信息、不产生实际交易。请勿输入个人敏感信息。免费实例空闲15分钟后可能休眠，重新访问可能需要约1分钟。原有本地启动方式不变。

## 启动（Python 3.10+，无第三方依赖）

解压 ZIP，在终端进入文件夹，执行：

```bash
python3 server.py
```

浏览器打开 http://127.0.0.1:8000 。Mac 用户也可在终端执行 `bash start.command`，它会打开浏览器。Ctrl+C 停止。

**不要双击 static/index.html。** file:// 页面无法请求后台 API。保持终端运行，并通过上述 HTTP 地址访问。若端口已占用，先停止旧版服务。

## 测试

```bash
python3 -m unittest discover -s tests -v
```

默认运行规则基线。界面右侧模拟账户、订单、可用资格和余额，左侧展示消费决策。点击快速场景或修改数据可以观察不同结果。左侧可进入权益详情、确认消费方案及演示完成页，支持返回；非会员超预算可试用另一档示例房价，重新请求后台计算。决策日志明确记录每条候选权益的规则判断。

## 可选的大模型意图理解

支持 OpenAI-compatible Chat Completions 服务。使用你自己的已授权模型服务，设置三个环境变量；`MEMBERSHIP_LLM_URL` 为 API 基础路径（通常以 /v1 结尾），而不是完整 chat/completions URL。

```bash
export MEMBERSHIP_LLM_URL='https://你的模型服务地址/v1'
export MEMBERSHIP_LLM_MODEL='你的模型名称'
# 如果模型服务需要凭证，在终端安全输入（避免写入源码）
read -s MEMBERSHIP_LLM_KEY; export MEMBERSHIP_LLM_KEY
python3 server.py
```

启动后在界面选择“大模型（需配置）”。仅将消费需求文本发送给模型，不发送会员身份、订单或权益状态。模型只提取消费任务、早餐需求、预算、人数；优惠金额、资格、预算判断由 Python 规则计算。模型响应出错时明确回落到规则基线。模型接口在当前环境未连接真实服务，适配代码不是已验证的大模型效果；不要输入敏感信息。使用外部服务可能产生费用。

## 关键文件

- `engine.py`：规则基线、可选模型适配、权益核验与推荐决策。
- `data/benefits.json`：4条结构化权益摘要及来源、未确认边界。
- `server.py`：本地 HTTP 接口，默认仅监听 127.0.0.1。
- `static/index.html`：研发验证界面，使用项目的淘宝橙与88VIP黑金设计语言。
- `tests/test_engine.py`：规则单元测试。

## 局限

没有真实淘宝/飞猪账号、交易、权益余额或核销接口。所有订单金额、资格、服务条件、覆盖人数都是模拟；截图中的权益摘要不是完整生产规则。没有实现真实开卡、购买、外部业务跳转、持久化用户反馈、跨平台授权。内部页面跳转为本地交互，替代房价为示例，不是真实酒店搜索结果。规则基线采用简单关键词，否定、复杂意图等存在已知限制；四项权益未覆盖全部88VIP。决策逻辑测试不是用户实验，也不是模型效果评估。

浏览器渲染验证使用 Playwright 注入测试桥接调用真实本地 HTTP API（环境的 Chromium 禁止直接访问 localhost），验证默认会员、非会员超预算、权益重叠三条路径。普通 HTTP 访问和接口另行通过 Python 请求验证。

V1.4 更新方式：已有 V1.3 可仅替换原项目 `static/index.html`，刷新网页即可。后台规则不变。浏览器交互经测试桥接实际 API，会员、非会员超预算调整、不推荐开卡及待核验路径均通过。
