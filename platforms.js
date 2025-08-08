/**
 * 平台配置对象，包含各个平台的基础URL和名称
 * @type {Object.<string, {base: string, name: string, pattern: RegExp}>}
 */
export const PLATFORMS = {
  // 代码托管平台
  gh: {
    base: "https://github.com",
    name: "GitHub",
    pattern: /^https:\/\/github\.com\//,
  },
  gl: {
    base: "https://gitlab.com",
    name: "GitLab",
    pattern: /^https:\/\/gitlab\.com\//,
  },
  gitea: {
    base: "https://gitea.com",
    name: "Gitea",
    pattern: /^https:\/\/gitea\.com\//,
  },
  codeberg: {
    base: "https://codeberg.org",
    name: "Codeberg",
    pattern: /^https:\/\/codeberg\.org\//,
  },
  sf: {
    base: "https://sourceforge.net",
    name: "SourceForge",
    pattern: /^https:\/\/sourceforge\.net\//,
  },
  aosp: {
    base: "https://android.googlesource.com",
    name: "AOSP",
    pattern: /^https:\/\/android\.googlesource\.com\//,
  },

  // AI/ML 平台
  hf: {
    base: "https://huggingface.co",
    name: "Hugging Face",
    pattern: /^https:\/\/huggingface\.co\//,
  },

  // 包管理平台
  npm: {
    base: "https://registry.npmjs.org",
    name: "npm",
    pattern: /^https:\/\/registry\.npmjs\.org\//,
  },
  pypi: {
    base: "https://pypi.org",
    name: "PyPI",
    pattern: /^https:\/\/pypi\.org\//,
  },
  "pypi-files": {
    base: "https://files.pythonhosted.org",
    name: "PyPI Files",
    pattern: /^https:\/\/files\.pythonhosted\.org\//,
  },
  conda: {
    base: "https://repo.anaconda.com",
    name: "Conda",
    pattern: /^https:\/\/repo\.anaconda\.com\//,
  },
  "conda-community": {
    base: "https://conda.anaconda.org",
    name: "Conda Community",
    pattern: /^https:\/\/conda\.anaconda\.org\//,
  },
  maven: {
    base: "https://repo1.maven.org",
    name: "Maven",
    pattern: /^https:\/\/repo1\.maven\.org\//,
  },
  apache: {
    base: "https://downloads.apache.org",
    name: "Apache",
    pattern: /^https:\/\/downloads\.apache\.org\//,
  },
  gradle: {
    base: "https://plugins.gradle.org",
    name: "Gradle",
    pattern: /^https:\/\/plugins\.gradle\.org\//,
  },
  rubygems: {
    base: "https://rubygems.org",
    name: "RubyGems",
    pattern: /^https:\/\/rubygems\.org\//,
  },
  cran: {
    base: "https://cran.r-project.org",
    name: "CRAN",
    pattern: /^https:\/\/cran\.r-project\.org\//,
  },
  cpan: {
    base: "https://www.cpan.org",
    name: "CPAN",
    pattern: /^https:\/\/www\.cpan\.org\//,
  },
  ctan: {
    base: "https://tug.ctan.org",
    name: "CTAN",
    pattern: /^https:\/\/tug\.ctan\.org\//,
  },
  golang: {
    base: "https://proxy.golang.org",
    name: "Go Modules",
    pattern: /^https:\/\/proxy\.golang\.org\//,
  },
  nuget: {
    base: "https://api.nuget.org",
    name: "NuGet",
    pattern: /^https:\/\/api\.nuget\.org\//,
  },
  crates: {
    base: "https://crates.io",
    name: "Crates.io",
    pattern: /^https:\/\/crates\.io\//,
  },
  packagist: {
    base: "https://repo.packagist.org",
    name: "Packagist",
    pattern: /^https:\/\/repo\.packagist\.org\//,
  },

  // 其他平台
  arxiv: {
    base: "https://arxiv.org",
    name: "arXiv",
    pattern: /^https:\/\/arxiv\.org\//,
  },
  fdroid: {
    base: "https://f-droid.org",
    name: "F-Droid",
    pattern: /^https:\/\/f-droid\.org\//,
  },
};

/**
 * 统一的路径转换函数
 * @param {string} path - 原始路径
 * @param {string} platformKey - 平台键值
 * @returns {string} - 转换后的路径
 */
export function transformPath(path, platformKey) {
  if (!PLATFORMS[platformKey]) {
    return path;
  }

  const prefix = `/${platformKey.replace(/-/g, "/")}/`;
  let transformedPath = path.replace(
    new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    "/"
  );

  // 特殊处理 crates.io API 路径
  if (platformKey === "crates") {
    // 转换路径以包含 API 前缀
    if (transformedPath.startsWith("/")) {
      // 处理不同的 API 端点：
      // /serde/1.0.0/download -> /api/v1/crates/serde/1.0.0/download
      // /serde -> /api/v1/crates/serde
      // /?q=query -> /api/v1/crates?q=query
      if (transformedPath === "/" || transformedPath.startsWith("/?")) {
        // 搜索端点
        transformedPath = transformedPath.replace("/", "/api/v1/crates");
      } else {
        // 特定 crate 端点
        transformedPath = `/api/v1/crates${transformedPath}`;
      }
    }
  }

  return transformedPath;
}

/**
 * 根据URL检测平台
 * @param {string} url - 要检测的URL
 * @returns {string|null} - 平台键值或null
 */
export function detectPlatform(url) {
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    if (platform.pattern.test(url)) {
      return key;
    }
  }
  return null;
}

/**
 * 转换URL为Xget格式
 * @param {string} url - 原始URL
 * @param {string} xgetDomain - Xget域名
 * @param {Object} enabledPlatforms - 启用的平台配置
 * @returns {string|null} - 转换后的URL或null
 */
export function transformUrl(url, xgetDomain, enabledPlatforms) {
  try {
    const platform = detectPlatform(url);
    if (!platform || !enabledPlatforms[platform]) {
      return null;
    }

    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search + urlObj.hash;
    const transformedPath = transformPath(path, platform);

    return `https://${xgetDomain}/${platform}${transformedPath}`;
  } catch (error) {
    console.error("转换 URL 时出错：", error);
    return null;
  }
}
