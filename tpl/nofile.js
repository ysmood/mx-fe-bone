import kit from 'nokit';

/**
 * option 收录了 no 命令主要的参数。函数 option 接收三个参数，最后一个是默认值。
 * 例如，启动时修改基础模板页配置，no --pageDev "page/my.js".
 *
 * 请阅读每个 option 配置，具体说明几个配置。
 *
 * - port
 *
 * 本地 mock 数据服务端口号。本地 mock 服务用于提供 mock 数据的数据服务。在 mock 目录 index.js
 * 配置的数据和路由就是针对该服务的。使用 127.0.0.1:${port} 访问。
 *
 * - pacPort
 *
 * 用作 PAC 代理的服务器端口号，PAC 代理是指 proxy auto configuration,
 * 其详细含义可以参考： [PAC](https://en.wikipedia.org/wiki/Proxy_auto-config)
 *
 * 在用no命令启动后，可以通过地址 http://127.0.0.1:${pacPort} 查看PAC配置具体内容。
 *
 * - devHost
 *
 * 用于配置PAC方式要代理掉得域名。例如要代理掉本地访问 www.demo.com 地址的数据时，需要配置
 * devHost 为 demo.com。
 *
 * - ethernet
 *
 * 在使用PAC方式代理的时候，需要指定网络配置，默认是WI-FI。命令行输入 networksetup -listallnetworkservices
 * 可以查看安装的网络配置，选择你正在使用的作为配置内容。
 *
 */

export default (task, option) => {
    option('--cdnPrefix <http://demo.com>', 'CDN 前缀', 'http://demo.com');
    option('--port <8732>', '本地 mock 数据服务端口号', '8732');
    option('--pacPort <58732>', '代理服务器端口', '58732');
    option('--devHost <demo.com>', '线上域名，结合 pac 代理', 'demo.com');
    option('--ethernet <Wi-Fi>', '网络设置', 'Wi-Fi');
    option('--mock <mock/index.js>', 'mock 配置入口', 'mock/index.js');
    option('--pageDev <page/dev.js>', '基础页面模板', 'page/dev.js');
    option('--asset <asset>', '编译输出文件夹', 'asset');
    option('--page <page>', '页面的编译输出文件夹', 'page');
    option('--src <src>', '源代码所在的文件夹', 'src');
    option('--srcPage <src/page>', '入口页面源代码所在的文件夹', 'src/page');
    option('--favicon <src/img/favicon.ico>', 'favicon 路径', 'src/img/favicon.ico');
    option('--hashMap <asset/hash-map.json>', '编译的 hashmap 输出路径', 'asset/hash-map.json');
    option('--webpack <on|off>', '是否开启 webpack', 'on');
    option('--pac <on|off>', '是否动设置全局 pac 代理', 'on');
    option('--liveReload <on|off>', '是否启动自动刷新页面', 'on');

    task('default dev', '启动调试服务器和 API 代理', require('mx-fe-bone-kit/lib/dev'));

    task('build', ['build-js'], '以产品模式编译项目到 asset 文件夹',
        require('mx-fe-bone-kit/lib/build')
    );

    task('build-js', ['copy-res'], '编译 js', (opts) => {
        process.env.NODE_ENV = 'production';
        process.env['mx-fe-bone-opts'] = JSON.stringify(opts);
        return kit.spawn('webpack');
    });

    task('copy-res', ['clean'], '将 src 目录中的资源文件拷贝到 asset 目录', async (opts) =>
        await * ['img', 'res'].map(
            p => kit.copy(`${opts.src}/${p}`, `${opts.asset}/${p}`).catch(kit._.noop)
        )
    );

    task('clean', '清理缓存和 build，有任何编译报错都可以先试试它', opts =>
        kit.remove(opts.asset)
    );

    task('lint', '检测代码风格是否符合规范', opts =>
        kit.spawn('eslint', [`${opts.src}/**/*.js`])
    );

    task('pac-off', '关闭 pac 代理配置', require('mx-fe-bone-kit/lib/pac-set').off);
};