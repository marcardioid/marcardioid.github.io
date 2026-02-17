import os
from datetime import datetime

# Theme-specific settings
SITENAME = "Marc Sleegers"
DOMAIN = "marcsleegers.com"
BIO_TEXT = "Infrequent ramblings."
FOOTER_TEXT = f'&copy; {datetime.now().year} Marc Sleegers. Licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.'

SITE_AUTHOR = "Marc Sleegers"
SITE_AUTHOR_TITLE = "Principal Software Engineer"
AUTHOR = SITE_AUTHOR
TWITTER_USERNAME = "@marcardioid"
SOCIAL_PROFILE_URLS = [
    "https://twitter.com/marcardioid",
    "https://github.com/marcardioid",
]
INDEX_DESCRIPTION = "Principal Engineer at Nike, especially interested in driving growth through insights – not just metrics. These are my infrequent ramblings."
INDEX_KEYWORDS = [
    "Marc Sleegers",
    "Marc Sleegers blog",
    "Marc Sleegers writing",
    "Principal Software Engineer",
    "Data Engineering",
    "Data Platform Engineering",
    "Analytics Engineering",
    "Software Architecture",
    "Engineering Leadership",
    "Technical Writing",
    "Python",
]

NAVIGATION_ITEMS = [
    ("/", "home", "Home"),
    ("/writing/", "writing", "Writing"),
    # ("/talks/", "talks", "Talks"),
    # ("/research/", "research", "Research"),
    # ("/uses/", "uses", "Uses"),
    # ("/now/", "now", "Now"),
]

ICONS_PATH = "images/icons"

GOOGLE_FONTS = [
    "Inter",
    "Source Code Pro",
]
GOOGLE_FONTS_BASE_URL = "https://fonts.googleapis.com/css"

SOCIAL_ICONS = [
    # (
    #     "mailto:mail@marcsleegers.com",
    #     "Contact (mail@marcsleegers.com)",
    #     "fa-envelope-square",
    # ),
    # ('https://twitter.com/marcardioid', 'Twitter', 'fa-twitter-square'),
    # ("https://github.com/marcardioid", "GitHub", "fa-github-square"),
    # ("/atom.xml", "RSS (Atom Feed)", "fa-rss-square"),
]
FONT_AWESOME_CSS_URL = "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"

THEME_COLOR = "#052"
THEME_TOGGLE_LABEL_DARK = "Switch to dark mode"
THEME_TOGGLE_LABEL_LIGHT = "Switch to light mode"
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

BLOG_URL = "writing/"
BLOG_TITLE = "Writing"
BLOG_DESCRIPTION = INDEX_DESCRIPTION
LEGACY_BLOG_PREFIX = "/blog"
LEGACY_BLOG_TARGET = f"/{BLOG_URL.rstrip('/')}"

ARTICLE_URL = BLOG_URL + "{date:%Y}/{date:%m}/{slug}/"
ARTICLE_SAVE_AS = ARTICLE_URL + "index.html"

DRAFT_URL = BLOG_URL + "drafts/{date:%Y}/{date:%m}/{slug}/"
DRAFT_SAVE_AS = DRAFT_URL + "index.html"
WITH_DRAFTS = True

PAGE_URL = "{slug}/"
PAGE_SAVE_AS = PAGE_URL + "index.html"

# Direct templates
DIRECT_TEMPLATES = ["index", "tags", "categories"]
INDEX_SAVE_AS = BLOG_URL + "index.html"
ARCHIVES_SAVE_AS = ""
ARCHIVES_DESCRIPTION = INDEX_DESCRIPTION
YEAR_ARCHIVE_SAVE_AS = BLOG_URL + "{date:%Y}/index.html"
MONTH_ARCHIVE_SAVE_AS = BLOG_URL + "{date:%Y}/{date:%m}/index.html"
AUTHOR_SAVE_AS = ""
AUTHORS_SAVE_AS = ""
TAG_URL = BLOG_URL + "tags/{slug}/"
TAG_SAVE_AS = BLOG_URL + "tags/{slug}/index.html"
TAGS_URL = BLOG_URL + "tags/"
TAGS_SAVE_AS = BLOG_URL + "tags/index.html"
CATEGORY_URL = BLOG_URL + "categories/{slug}/"
CATEGORY_SAVE_AS = BLOG_URL + "categories/{slug}/index.html"
CATEGORIES_URL = BLOG_URL + "categories/"
CATEGORIES_SAVE_AS = BLOG_URL + "categories/index.html"
USE_FOLDER_AS_CATEGORY = True
DEFAULT_CATEGORY = "Uncategorized"
CATEGORY_TITLE = "Topics"
CATEGORY_DESCRIPTIONS = {
    "engineering": "Articles on systems design, architecture, and large-scale data platforms.",
    "leadership": "Thoughts on technical leadership, team design, and engineering culture.",
    "architecture": "Exploring software architecture, trade-offs, and platform thinking."
}


# Feed generation
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
        "markdown.extensions.toc": {
            "title": "On this page", 
            "anchorlink": "True"},
        "markdown.extensions.footnotes": {"SEPARATOR": "-"},
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

PLUGINS = ["neighbors", "sitemap", "webassets", "share_post", "series", "readtime"]

GOOGLE_ANALYTICS = "G-16VCVC4J5J"

SITEMAP = {
    "format": "xml",
    "exclude": [
        r"^404\.html$",
        r"^writing/\d{4}/$",
        r"^writing/\d{4}/\d{2}/$",
        r"writing/tags",
        r"writing/categories",
        r"^splash/$",
        r"^rpsls/$",
        r"^blog/$",
    ],
    "priorities": {"articles": 0.8, "indexes": 0.5, "pages": 1.0},
    "changefreqs": {"articles": "monthly", "indexes": "weekly", "pages": "monthly"},
}

WEBASSETS_CONFIG = [
    ("cache", False),
    ("manifest", False),
    ("url_expire", False),
    ("versions", False),
]
