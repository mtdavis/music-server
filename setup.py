from setuptools import find_packages
from setuptools import setup

setup(
    name='music_server',
    version='0.0.1',
    description="Mike's Music Server",
    author='Mike Davis',
    author_email='michaeltdavis@gmail.com',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'flask==2.2.2',
        'flask-restx==1.0.6',
        'flask-compress==1.13',
        'eyed3==0.9.6',
        'pylast==4.2.0',
        'lyricsgenius==3.0.0',
        'tabulate==0.8.9',
    ],
    extras_require={
        'dev': [
            'autopep8==2.0.1',
            'mypy==1.0.0',
        ],
    },
    license='MIT',
)
