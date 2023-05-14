import os

# Theme-specific settings
SITENAME = "Marc Sleegers"
DOMAIN = "marcsleegers.com"
BIO_TEXT = "Infrequent ramblings."
FOOTER_TEXT = '&copy; 2023 Marc Sleegers. Licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.'

SITE_AUTHOR = "Marc Sleegers"
TWITTER_USERNAME = "@marcardioid"
GOOGLE_PLUS_URL = ""
INDEX_DESCRIPTION = "Principal Engineer at Nike, especially interested in driving growth through insights – not just metrics. These are my infrequent ramblings."
INDEX_KEYWORDS = [
    "Marc",
    "Sleegers",
    "About",
    "Blog",
    "Resume",
    "CV",
    "Portfolio",
    "Marcardioid",
    "Pumpkinsoup",
    "AWildPumpkin",
    "Computer",
    "Science",
    "Developer",
    "Programmer",
    "Software",
    "Data",
    "Engineer",
    "Technology",
]

NAVIGATION_ITEMS = []
# NAVIGATION_ITEMS = [
#     ('/blog/', 'blog', 'Blog'),
#     ('/blog/archive/', 'archive', 'Archive'),
# ]

ICONS_PATH = "images/icons"

GOOGLE_FONTS = [
    "Inter",
    "Source Code Pro",
]

SOCIAL_ICONS = [
    # (
    #     "mailto:mail@marcsleegers.com",
    #     "Contact (mail@marcsleegers.com)",
    #     "fa-envelope-square",
    # ),
    # ('https://facebook.com/marc.sleegers', 'Facebook', 'fa-facebook-square'),
    # ('https://twitter.com/marcardioid', 'Twitter', 'fa-twitter-square'),
    # ("https://github.com/marcardioid", "GitHub", "fa-github-square"),
    # ('/files/CV_Marc-Sleegers_2015_EN_WEB.pdf', 'Resume', 'fa-check-square'),
    # ("/atom.xml", "RSS (Atom Feed)", "fa-rss-square"),
]

THEME_COLOR = "#052"
ASSET_URL = "/theme/style.min.css"

# Pelican settings
RELATIVE_URLS = False
SITEURL = "http://localhost:8000"
TIMEZONE = "Europe/Amsterdam"
DEFAULT_DATE = "fs"
DEFAULT_DATE_FORMAT = "%B %d, %Y"
DEFAULT_PAGINATION = False
SUMMARY_MAX_LENGTH = 50

THEME = "themes/pneumatic"

# Relocate blog directory
BLOG_URL = "blog/"
BLOG_DESCRIPTION = "These are my infrequent ramblings."

ARTICLE_URL = BLOG_URL + "{date:%Y}/{date:%m}/{slug}/"
ARTICLE_SAVE_AS = ARTICLE_URL + "index.html"

DRAFT_URL = BLOG_URL + "drafts/{date:%Y}/{date:%m}/{slug}/"
DRAFT_SAVE_AS = DRAFT_URL + "index.html"

PAGE_URL = "{slug}/"
PAGE_SAVE_AS = PAGE_URL + "index.html"

ARCHIVES_SAVE_AS = BLOG_URL + "archive/index.html"
ARCHIVES_DESCRIPTION = "These are the archives of my infrequent ramblings."
YEAR_ARCHIVE_SAVE_AS = BLOG_URL + "{date:%Y}/index.html"
MONTH_ARCHIVE_SAVE_AS = BLOG_URL + "{date:%Y}/{date:%m}/index.html"

# Disable authors, categories, tags, and category pages
DIRECT_TEMPLATES = ["index", "archives"]
INDEX_SAVE_AS = BLOG_URL + "index.html"
CATEGORY_SAVE_AS = ""
TAG_SAVE_AS = ""
TAGS_URL = ""

# Disable Atom feed generation
FEED_ATOM = "atom.xml"
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None

TYPOGRIFY = True
MARKDOWN = {
    "extension_configs": {
        "markdown.extensions.codehilite": {"linenums": "True"},
        "markdown.extensions.admonition": {},
        "markdown.extensions.extra": {},
        "markdown.extensions.toc": {"anchorlink": "True"},
        "markdown.extensions.footnotes": {},
        "markdown.extensions.meta": {},
    },
    "output_format": "html5",
}
JINJA_ENVIRONMENT = {"trim_blocks": True, "lstrip_blocks": True}

CACHE_CONTENT = False
DELETE_OUTPUT_DIRECTORY = False
OUTPUT_PATH = "output/develop/"
PATH = "content"

templates = ["404.html"]
TEMPLATE_PAGES = {page: page for page in templates}

STATIC_PATHS = ["images", "extra"]
IGNORE_FILES = []

EXTRA_PATH_METADATA = {
    os.path.join("extra", file): {"path": file}
    for file in [
        os.path.relpath(os.path.join(root, file), "content/extra/")
        for root, _, files in os.walk("content/extra/")
        for file in files
    ]
}
PAGE_EXCLUDES = ["extra"]
ARTICLE_EXCLUDES = ["extra"]

PLUGINS = ["neighbors", "sitemap", "webassets", "share_post", "series"]

GOOGLE_ANALYTICS = "G-16VCVC4J5J"

SITEMAP = {
    "format": "xml",
    "priorities": {"articles": 0.5, "indexes": 0.5, "pages": 0.5},
    "changefreqs": {"articles": "monthly", "indexes": "weekly", "pages": "monthly"},
}

WEBASSETS_CONFIG = [
    ("cache", False),
    ("manifest", False),
    ("url_expire", False),
    ("versions", False),
]
