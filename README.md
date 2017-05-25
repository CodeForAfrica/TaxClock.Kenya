## TaxClock

Time is money. So, paying your tax means that you are actually giving government your time, or labour. This project helps you calculate exactly how much time you spend working for the government.

Original website is accessible at [https://taxclock.codeforkenya.org/](https://taxclock.codeforkenya.org/)

### Instances:

- Kenya: [https://taxclock.codeforkenya.org/](https://taxclock.codeforkenya.org/)
- South Africa: [https://taxclock-za.codeforafrica.org/](https://taxclock-za.codeforafrica.org/)

### Installation:

TaxClock uses [Jekyll](http://jekyllrb.com/).

#### Deploy locally
To run locally, ensure that you are in the parent directory and run the commands below:
```
gem install jekyll bundler
jekyll s
```

#### Deploy to Github Pages

Simply have it on Github and follow instructions [here](https://pages.github.com/).

#### Deploy to S3

To deploy to S3, we are using the very cool [s3_website gem](https://github.com/laurilehmijoki/s3_website).

Make sure to copy and edit `s3_website.example.yml` as `s3_website.yml` and then;

```
gem install s3_website
s3_website cfg apply
s3_website push 
```

For detailed instructions, check out [s3_website gem](https://github.com/laurilehmijoki/s3_website).

---

## License

We have licensed the code here under an [MIT License](./LICENSE.txt). While all content is released under a [Creative Commons 4 Attribution license](https://creativecommons.org/licenses/by/4.0/). You are free to reuse it to help empower your own community.

All the code written by Code4SA is licensed under a Creative Commons Attribution 4.0 International License. 
