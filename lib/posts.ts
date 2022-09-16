import {remark} from 'remark';
import html from 'remark-html';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {VFile} from "vfile";

const postsDirectory: string = path.join(process.cwd(), 'posts');

export function getSortedPostsData(): { id: string, date: string, title: string }[] {
    // Get file names under /posts
    const fileNames: string[] = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName: string) => {
        // Remove ".md" from file name to get id
        const id: string = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath: string = path.join(postsDirectory, fileName);
        const fileContents: string = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult: matter.GrayMatterFile<string> = matter(fileContents);

        // Combine the data with the id
        return {
            id,
            ...(matterResult.data as { date: string; title: string }),
        };
    });
    // Sort posts by date
    return allPostsData.sort(({date: a}: { date: string }, {date: b}: { date: string }) => {
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    });
}

export function getAllPostIds(): { params: { id: string } }[] {
    const fileNames: string[] = fs.readdirSync(postsDirectory);

    // Returns an array that looks like this:
    // [
    //   {
    //     params: {
    //       id: 'ssg-ssr'
    //     }
    //   },
    //   {
    //     params: {
    //       id: 'pre-rendering'
    //     }
    //   }
    // ]
    return fileNames.map((fileName:string) => {
        return {
            params: {
                id: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPostData(id:string):  Promise<{date: string, title: string, id: string, contentHtml: string}>{
    const fullPath:string = path.join(postsDirectory, `${id}.md`);
    const fileContents:string = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult:matter.GrayMatterFile<string> = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent:VFile = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml:string = processedContent.toString();

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        ...(matterResult.data as { date: string; title: string }),
    };
}
