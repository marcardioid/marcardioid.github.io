# Theme-specific settings
SITENAME = 'Marc Sleegers'
DOMAIN = 'marcsleegers.com'
BIO_TEXT = 'Infrequent ramblings.'
FOOTER_TEXT = '&copy; 2020 Marc Sleegers. Licensed <a href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.'

SITE_AUTHOR = 'Marc Sleegers'
TWITTER_USERNAME = '@marcardioid'
GOOGLE_PLUS_URL = ''
INDEX_DESCRIPTION = 'Senior data engineer at Nike. I love automating my daily tasks with Python and blogging about technology. These are my infrequent ramblings.'
INDEX_KEYWORDS = [
    'Marc', 'Sleegers', 'About', 'Blog', 'Resume', 'Portfolio',
    'Marcardioid', 'Pumpkinsoup', 'AWildPumpkin',
    'Computer', 'Science', 'Developer', 'Programmer', 'Software', 'Data', 'Engineer', 'Technology',
]

NAVIGATION_ITEMS = [
    ('/blog/', 'blog', 'Blog'),
    ('/blog/archive/', 'archive', 'Archive'),
]

ICONS_PATH = 'images/icons'

GOOGLE_FONTS = [
    "Raleway:400,600",
    "Source Code Pro",
]

SOCIAL_ICONS = [
    ('mailto:mail@marcsleegers.com', 'Contact (mail@marcsleegers.com)', 'fa-envelope-square'),
    ('https://facebook.com/marc.sleegers', 'Facebook', 'fa-facebook-square'),
    ('https://twitter.com/marcardioid', 'Twitter', 'fa-twitter-square'),
    ('https://github.com/marcardioid', 'GitHub', 'fa-github-square'),
    # ('/files/CV_Marc-Sleegers_2015_EN_WEB.pdf', 'Resume', 'fa-check-square'),
    ('/atom.xml', 'RSS (Atom Feed)', 'fa-rss-square'),
]

THEME_COLOR = '#FF8000'

# Pelican settings
RELATIVE_URLS = False
SITEURL = 'http://localhost:8000'
TIMEZONE = 'Europe/Amsterdam'
DEFAULT_DATE = 'fs'
DEFAULT_DATE_FORMAT = '%B %d, %Y'
DEFAULT_PAGINATION = False
SUMMARY_MAX_LENGTH = 50

THEME = 'themes/pneumatic'

# Relocate blog directory
BLOG_URL = 'blog/'
BLOG_DESCRIPTION = 'These are my infrequent ramblings.'

ARTICLE_URL = BLOG_URL + '{date:%Y}/{date:%m}/{slug}/'
ARTICLE_SAVE_AS = ARTICLE_URL + 'index.html'

DRAFT_URL = BLOG_URL + 'drafts/{date:%Y}/{date:%m}/{slug}/'
DRAFT_SAVE_AS = DRAFT_URL + 'index.html'

PAGE_URL = '{slug}/'
PAGE_SAVE_AS = PAGE_URL + 'index.html'

ARCHIVES_SAVE_AS = BLOG_URL + 'archive/index.html'
ARCHIVES_DESCRIPTION = 'These are the archives of my infrequent ramblings.'
YEAR_ARCHIVE_SAVE_AS = BLOG_URL + '{date:%Y}/index.html'
MONTH_ARCHIVE_SAVE_AS = BLOG_URL + '{date:%Y}/{date:%m}/index.html'

# Disable authors, categories, tags, and category pages
DIRECT_TEMPLATES = ['index', 'archives']
INDEX_SAVE_AS = BLOG_URL + 'index.html'
CATEGORY_SAVE_AS = ''

# Disable Atom feed generation
FEED_ATOM = 'atom.xml'
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None

TYPOGRIFY = True
MD_EXTENSIONS = ['admonition', 'codehilite(linenums=True)', 'extra', 'toc(anchorlink=True)', 'footnotes']

CACHE_CONTENT = False
DELETE_OUTPUT_DIRECTORY = False
OUTPUT_PATH = 'output/develop/'
PATH = 'content'

templates = ['404.html']
TEMPLATE_PAGES = {page: page for page in templates}

STATIC_PATHS = ['images', 'uploads', 'extra']
IGNORE_FILES = ['style.css']

extras = ['favicon.ico', 'robots.txt', 'humans.txt']
EXTRA_PATH_METADATA = {'extra/%s' % file: {'path': file} for file in extras}

PLUGIN_PATHS = ['plugins']
PLUGINS = ['neighbors', 'render_math', 'sitemap', 'assets', 'share_post', 'series']

GOOGLE_ANALYTICS = 'UA-72969416-1'

SITEMAP = {
    'format': 'xml',
    'priorities': {
        'articles': 0.5,
        'indexes': 0.5,
        'pages': 0.5
    },
    'changefreqs': {
        'articles': 'monthly',
        'indexes': 'weekly',
        'pages': 'monthly'
    }
}

ASSET_CONFIG = [
    ('cache', False),
    ('manifest', False),
    ('url_expire', False),
    ('versions', False),
]