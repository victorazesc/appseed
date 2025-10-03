"use client";

import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";
import {
  ArrowUpIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudIcon,
  CloudUploadIcon,
  CpuIcon,
  GlobeIcon,
  LayersIcon,
  LineChartIcon,
  LinkIcon,
  ListCheckIcon,
  PenToolIcon,
  MailIcon,
  MapPinIcon,
  RocketIcon,
  PhoneIcon,
  SearchIcon,
  ServerIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  StarIcon,
  SendIcon,
  TestTubeIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";
import { useTranslation } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";
import { FacebookIcon, InstagramIcon } from "lucide-react";

const HERO_STAT_ICONS = [RocketIcon, CheckCircleIcon, ClockIcon];
const SERVICE_ICONS = [
  RocketIcon,
  TrendingUpIcon,
  GlobeIcon,
  SmartphoneIcon,
  LinkIcon,
  ShieldCheckIcon,
];
const PROCESS_STEP_ICONS = [
  SearchIcon,
  PenToolIcon,
  BoltIcon,
  TestTubeIcon,
  CloudUploadIcon,
  LineChartIcon,
];
const TECHNOLOGY_GROUP_ICONS = [CpuIcon, ServerIcon, CloudIcon, SmartphoneIcon];
const CAPABILITY_ICONS = [UsersIcon, LayersIcon, BoltIcon, ShieldCheckIcon];
const CONTACT_DETAIL_ICONS = [MailIcon, PhoneIcon, MapPinIcon];

export default function Home() {
  const { messages } = useTranslation();
  const { common, home } = messages;

  const heroStats = home.hero.stats.map((stat, index) => ({
    ...stat,
    icon: HERO_STAT_ICONS[index] ?? HERO_STAT_ICONS[HERO_STAT_ICONS.length - 1],
  }));

  const serviceCards = home.services.cards.map((card, index) => ({
    ...card,
    icon: SERVICE_ICONS[index] ?? SERVICE_ICONS[0],
  }));

  const processSteps = home.process.steps.map((step, index) => ({
    ...step,
    icon: PROCESS_STEP_ICONS[index] ?? PROCESS_STEP_ICONS[0],
  }));

  const technologyGroups = home.technologies.groups.map((group, index) => ({
    ...group,
    icon: TECHNOLOGY_GROUP_ICONS[index] ?? TECHNOLOGY_GROUP_ICONS[0],
  }));

  const capabilities = home.capabilities.map((capability, index) => ({
    ...capability,
    icon: CAPABILITY_ICONS[index] ?? CAPABILITY_ICONS[0],
  }));

  const contactDetails = home.contact.contactDetails.map((detail, index) => ({
    ...detail,
    icon: CONTACT_DETAIL_ICONS[index] ?? CONTACT_DETAIL_ICONS[0],
  }));

  const footerCopy = home.footer.copy.replace("{{year}}", String(new Date().getFullYear()));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="#hero" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
              <Logo className="h-8" />
            </span>
            <span className="text-lg">AppSeed</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {home.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <Button asChild className="hidden md:flex">
              <Link href="#contact">{common.actions.startProject}</Link>
            </Button>
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pb-24 pt-16 sm:px-6 lg:gap-32 lg:pb-32">
        <section
          id="hero"
          className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start"
        >
          <div className="space-y-10">
            <Badge className="w-fit gap-2 rounded-full bg-emerald-100/80 px-5 py-1.5 text-sm font-medium text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-200">
              <SparklesIcon className="h-4 w-4 text-emerald-500" />
              {home.hero.badge}
            </Badge>
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[56px]">
                {home.hero.title.prefix}{" "}
                <span className="text-emerald-500">{home.hero.title.highlightOne}</span>{" "}
                {home.hero.title.middle}{" "}
                <span className="text-emerald-500">{home.hero.title.highlightTwo}</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {home.hero.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="#contact">
                  {common.actions.startMvp}
                  <span aria-hidden className="ml-2 text-xl">
                    →
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="#services">{common.actions.viewServices}</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <IconBubble className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                      <stat.icon className="h-4 w-4" />
                    </IconBubble>
                    {stat.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-[32px] border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 via-background to-emerald-100/80 p-8 text-emerald-800 shadow-[0_30px_80px_-40px_rgba(16,185,129,0.65)] dark:border-emerald-500/30 dark:from-emerald-500/10 dark:via-background dark:to-emerald-500/20 dark:text-emerald-100 lg:sticky lg:top-32">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-200">
              <IconBubble className="h-9 w-9 rounded-2xl bg-background/90 text-emerald-500 shadow dark:bg-emerald-500/10 dark:text-emerald-200">
                <StarIcon className="h-5 w-5" />
              </IconBubble>
              {home.hero.highlight.title}
            </div>
            <p className="mt-6 text-base leading-relaxed text-emerald-700 dark:text-emerald-100/80">
              {home.hero.highlight.subtitle}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-emerald-700 dark:text-emerald-100/80">
              {home.hero.highlight.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs uppercase tracking-[0.26em] text-emerald-600/80 dark:text-emerald-300/70">
              {home.hero.highlight.footnote}
            </p>
          </aside>
        </section>

        <section id="services" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {home.services.badge}
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {home.services.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              {home.services.description}
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.map((service) => (
              <Card key={service.title} className="h-full border-border/70 bg-card">
                <CardHeader>
                  <IconBubble>
                    <service.icon className="h-5 w-5 text-emerald-500" />
                  </IconBubble>
                  <div className="space-y-1">
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {service.items.map((item) => (
                      <BulletItem key={item}>{item}</BulletItem>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="#contact">{home.services.cta}</Link>
            </Button>
          </div>
        </section>

        <section id="process" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {home.process.badge}
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {home.process.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              {home.process.description}
            </p>
          </header>
          <div className="overflow-hidden rounded-[36px] bg-emerald-50/70 px-6 py-12 shadow-[0_32px_80px_-60px_rgba(16,185,129,0.65)] dark:bg-emerald-500/10 sm:px-10">
            <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
              {home.process.timeline.map((step, index) => (
                <div
                  key={step.number}
                  className="flex flex-1 flex-col items-center text-center"
                >
                  <div className="flex w-full items-center justify-center gap-4">
                    {index > 0 ? (
                      <span className="hidden h-[2px] flex-1 rounded-full bg-gradient-to-r from-emerald-200 via-emerald-200 to-emerald-300 dark:from-emerald-500/40 dark:via-emerald-500/30 dark:to-emerald-500/20 sm:block" />
                    ) : null}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-lg font-semibold text-white shadow-[0_18px_40px_-28px_rgba(16,185,129,0.85)] dark:from-emerald-400 dark:to-emerald-500">
                      {step.number}
                    </div>
                    {index < home.process.timeline.length - 1 ? (
                      <span className="hidden h-[2px] flex-1 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-200 dark:from-emerald-500/20 dark:via-emerald-500/30 dark:to-emerald-500/40 sm:block" />
                    ) : null}
                  </div>
                  <div className="mt-6 space-y-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {processSteps.map((step, index) => (
              <Card key={step.title} className="h-full border-border/70 bg-card">
                <CardHeader className="items-start">
                  <div className="flex items-start gap-4">
                    <div className="text-emerald-500">
                      <span className="text-3xl font-semibold">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IconBubble>
                          <step.icon className="h-5 w-5 text-emerald-500" />
                        </IconBubble>
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                      </div>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {step.items.map((item) => (
                      <BulletItem key={item}>{item}</BulletItem>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Badge className="bg-card text-sm text-emerald-600 shadow-sm ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/50">
              {home.process.timelineBadge}
            </Badge>
          </div>
        </section>

        <section id="technologies" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {home.technologies.badge}
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {home.technologies.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              {home.technologies.description}
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-2">
            {technologyGroups.map((group) => (
              <Card key={group.title} className="h-full border-border/70 bg-card">
                <CardHeader className="flex-row items-center gap-4">
                  <IconBubble>
                    <group.icon className="h-5 w-5 text-emerald-500" />
                  </IconBubble>
                  <CardTitle>{group.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {group.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
              >
                <IconBubble>
                  <capability.icon className="h-5 w-5 text-emerald-500" />
                </IconBubble>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {capability.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="space-y-10 rounded-[40px] bg-slate-900 px-6 py-16 text-slate-100 shadow-[0_80px_120px_-60px_rgba(15,23,42,0.7)] dark:bg-slate-900 sm:px-10 lg:px-16">
          <header className="space-y-3 text-center">
            <Badge className="mx-auto bg-slate-800 text-slate-100">
              {home.faq.badge}
            </Badge>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {home.faq.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-300">
              {home.faq.description}
            </p>
          </header>
          <Accordion>
            {home.faq.items.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                title={faq.question}
                defaultOpen={index === 0}
              >
                <p>{faq.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section id="contact" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {home.contact.badge}
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {home.contact.title.prefix}{" "}
              <span className="text-emerald-500">{home.contact.title.highlight}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              {home.contact.description}
            </p>
          </header>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_1fr]">
            <Card className="h-full space-y-6 border-border/70 bg-card p-8 shadow-lg sm:p-10">
              <div className="flex items-center gap-3">
                <IconBubble className="h-11 w-11 rounded-2xl bg-emerald-500 text-white shadow">
                  <SendIcon className="h-5 w-5" />
                </IconBubble>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {home.contact.formCard.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {home.contact.formCard.subtitle}
                  </p>
                </div>
              </div>
              <ContactForm
                projectTypes={home.contact.formOptions.projectTypes}
                budgetRanges={home.contact.formOptions.budgetRanges}
                timelineOptions={home.contact.formOptions.timelineOptions}
              />
            </Card>
            <div className="space-y-6">
              <Card className="space-y-6 border-border/70 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <IconBubble className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <ListCheckIcon className="h-5 w-5" />
                  </IconBubble>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{home.contact.contactCard.title}</h3>
                    <p className="text-sm text-muted-foreground">{home.contact.contactCard.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-4 text-sm">
                  {contactDetails.map((detail) => (
                    <li key={detail.label} className="flex items-start gap-3 text-muted-foreground">
                      <IconBubble className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                        <detail.icon className="h-4 w-4" />
                      </IconBubble>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">{detail.label}</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{detail.value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="space-y-5 border-border/70 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <IconBubble className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <CheckCircleIcon className="h-5 w-5" />
                  </IconBubble>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{home.contact.differentiatorsCard.title}</h3>
                    <p className="text-sm text-muted-foreground">{home.contact.differentiatorsCard.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {home.contact.differentiatorsCard.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-slate-800 bg-slate-900 text-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6 lg:flex-row lg:gap-16">
          <div className="flex-1 space-y-6">
            <Link href="#hero" className="flex items-center gap-3 text-slate-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Logo className="h-5" />
              </span>
              <span className="text-xl font-semibold">AppSeed</span>
            </Link>
            <p className="max-w-sm text-sm text-slate-400">
              {home.footer.description}
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              {contactDetails.map((detail) => (
                <li key={detail.label} className="flex items-center gap-3">
                  <IconBubble className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <detail.icon className="h-4 w-4" />
                  </IconBubble>
                  {detail.value}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid flex-1 gap-10 sm:grid-cols-2 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                {home.footer.quickLinksTitle}
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {home.navigation.map((item) => (
                  <li key={item.href}>
                    <Link className="transition-colors hover:text-emerald-400" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                {home.footer.legalTitle}
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {home.footer.legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link className="transition-colors hover:text-emerald-400" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 pt-2 text-slate-500">
                <Link
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/60 text-emerald-400"
                  href="https://www.instagram.com/appseedsoftware"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon className="h-4" />
                </Link>
                <Link
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/60 text-emerald-400"
                  href="https://www.facebook.com/profile.php?id=61581725999138"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon className="h-4" />
                </Link>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/60 text-emerald-400">
                  <Logo className="h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>{footerCopy}</span>
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700/80 bg-slate-800/80 text-slate-200 hover:border-emerald-500/60 hover:bg-slate-800 sm:w-auto"
            >
              <Link href="#hero" className="flex items-center gap-2">
                <ArrowUpIcon className="h-4 w-4" />
                {common.actions.backToTop}
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function IconBubble({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200",
        className,
      )}
    >
      {children}
    </span>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}
